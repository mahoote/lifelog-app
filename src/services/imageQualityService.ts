import { File } from 'expo-file-system'
import {
    BorderTypes,
    ColorConversionCodes,
    DataTypes,
    Mat,
    OpenCV,
    Size,
} from 'react-native-fast-opencv'

import { imageProcessingConfig } from '@/config/imageProcessingConfig'
import { ImageQualityMetrics } from '@/types/imageProcessing'

/**
 * Width and height of the final perceptual hash.
 *
 * An 8 x 8 hash produces 64 bits. Each bit represents whether a downsampled
 * pixel is brighter or darker than the average pixel value.
 */
const HASH_SIZE = 8

/**
 * Intermediate resize size used before reducing the image to the final hash size.
 *
 * Resizing to 32 x 32 first helps smooth out small pixel-level differences before
 * the image is reduced to 8 x 8 for hashing.
 */
const HASH_RESIZE_SIZE = 32

/**
 * Reads an image from disk and calculates quality metrics used for filtering
 * and duplicate detection.
 *
 * The image is converted to grayscale once, then reused for:
 * - Blur detection using Laplacian variance
 * - Brightness measurement using mean pixel intensity
 * - Contrast measurement using standard deviation
 * - Near-duplicate detection using a perceptual hash
 *
 * OpenCV matrices allocate native resources, so every created matrix must be
 * released in a `finally` block.
 *
 * @param fileUri URI of the image file to analyse.
 * @returns Calculated quality metrics for the image.
 * @throws If the image file does not exist, is empty, or has an unsupported channel count.
 */
export async function analyzeImageQuality(fileUri: string): Promise<ImageQualityMetrics> {
    const base64 = await readImageAsBase64(fileUri)

    // Decode the image into an OpenCV matrix.
    const source = Mat.createFromBase64(base64)

    try {
        // Convert the image to one grayscale channel so all metrics work on the same data.
        const grayscale = toGrayscale(source)

        try {
            const blurScore = calculateLaplacianVariance(grayscale)
            const brightnessScore = calculateMean(grayscale)
            const contrastScore = calculateStandardDeviation(grayscale)
            const perceptualHash = calculatePerceptualHash(grayscale)

            return {
                blurScore,
                brightnessScore,
                contrastScore,
                perceptualHash,
            }
        } finally {
            grayscale.release()
        }
    } finally {
        source.release()
    }
}

/**
 * Checks whether an image should be treated as blurry.
 *
 * Lower Laplacian variance means fewer strong edges, which usually indicates
 * blur or out-of-focus content.
 *
 * @param metrics Quality metrics calculated for an image.
 * @returns `true` when the blur score is below the configured threshold.
 */
export function isImageBlurry(metrics: ImageQualityMetrics): boolean {
    return metrics.blurScore < imageProcessingConfig.blurVarianceThreshold
}

/**
 * Checks whether an image has too little contrast to be useful.
 *
 * The current implementation only checks contrast. Brightness is still returned
 * by `analyzeImageQuality`, but it is not used here.
 *
 * @param metrics Quality metrics calculated for an image.
 * @returns `true` when the contrast score is below the configured threshold.
 */
export function hasLowQuality(metrics: ImageQualityMetrics): boolean {
    return metrics.contrastScore < imageProcessingConfig.lowContrastThreshold
}

/**
 * Calculates the Hamming distance between two perceptual hashes.
 *
 * The distance is the number of bit positions that differ. If the hashes have
 * different lengths, the extra characters are counted as differences.
 *
 * @param firstHash First binary hash string.
 * @param secondHash Second binary hash string.
 * @returns Number of differing positions between the two hashes.
 */
export function getHashDistance(firstHash: string, secondHash: string): number {
    const length = Math.min(firstHash.length, secondHash.length)

    // Start with the length difference so missing bits count as different.
    let distance = Math.abs(firstHash.length - secondHash.length)

    for (let index = 0; index < length; index += 1) {
        if (firstHash[index] !== secondHash[index]) {
            distance += 1
        }
    }

    return distance
}

/**
 * Checks whether two perceptual hashes are close enough to be treated as near duplicates.
 *
 * @param firstHash First binary hash string.
 * @param secondHash Second binary hash string.
 * @returns `true` when the hash distance is within the configured duplicate threshold.
 */
export function areNearDuplicates(firstHash: string, secondHash: string): boolean {
    return getHashDistance(firstHash, secondHash) <= imageProcessingConfig.duplicateHashDistanceThreshold
}

/**
 * Reads an image file from disk as a base64 string.
 *
 * This validates that the file exists and contains data before OpenCV tries to
 * decode it, which gives clearer error messages when the input is invalid.
 *
 * @param fileUri URI of the image file to read.
 * @returns Base64-encoded image data.
 * @throws If the file does not exist or is empty.
 */
async function readImageAsBase64(fileUri: string): Promise<string> {
    const file = new File(fileUri)

    if (!file.exists) {
        throw new Error(`Image file does not exist: ${fileUri}`)
    }

    if (file.size <= 0) {
        throw new Error(`Image file is empty: ${fileUri}`)
    }

    return file.base64()
}

/**
 * Converts an OpenCV image matrix to grayscale.
 *
 * Supported inputs:
 * - 1 channel, already grayscale
 * - 3 channels, RGB
 * - 4 channels, RGBA
 *
 * @param source Source image matrix.
 * @returns A new grayscale matrix.
 * @throws If the image has an unsupported number of channels.
 */
function toGrayscale(source: Mat): Mat {
    const sourceBuffer = source.toBuffer('uint8')
    const grayscale = Mat.create(sourceBuffer.rows, sourceBuffer.cols, DataTypes.CV_8U)

    if (sourceBuffer.channels === 1) {
        // Already grayscale. Clone it so callers can safely release the returned matrix.
        return OpenCV.clone(source)
    }

    if (sourceBuffer.channels === 4) {
        OpenCV.cvtColor(source, grayscale, ColorConversionCodes.COLOR_RGBA2GRAY)
        return grayscale
    }

    if (sourceBuffer.channels === 3) {
        OpenCV.cvtColor(source, grayscale, ColorConversionCodes.COLOR_RGB2GRAY)
        return grayscale
    }

    // The allocated grayscale matrix is not returned, so it must be released here.
    grayscale.release()

    throw new Error(`Unsupported image channel count: ${sourceBuffer.channels}`)
}

/**
 * Calculates blur using the variance of the Laplacian.
 *
 * The Laplacian highlights edges and rapid intensity changes. A sharp image
 * usually has many strong edges, giving a higher variance. A blurry image has
 * weaker edges, giving a lower variance.
 *
 * The image is resized first so the blur score is less dependent on the original
 * image resolution.
 *
 * @param grayscale Grayscale image matrix.
 * @returns Laplacian variance blur score.
 */
function calculateLaplacianVariance(grayscale: Mat): number {
    const targetWidth = 640
    const targetHeight = 360

    const resized = Mat.create(targetHeight, targetWidth, DataTypes.CV_8U)
    const laplacian16 = Mat.create(targetHeight, targetWidth, DataTypes.CV_16S)
    const laplacianAbs = Mat.create(targetHeight, targetWidth, DataTypes.CV_8U)

    try {
        // Normalise input size so scores are more comparable between images.
        OpenCV.resize(grayscale, resized, Size.create(targetWidth, targetHeight), 0, 0, 0)

        // Calculate second-order image gradients. Strong gradients correspond to edges.
        OpenCV.Laplacian(resized, laplacian16, DataTypes.CV_16S, 3, 1, 0, BorderTypes.BORDER_DEFAULT)

        // Convert signed 16-bit gradient values back to absolute 8-bit values.
        OpenCV.convertScaleAbs(laplacian16, laplacianAbs)

        const pixels = laplacianAbs.toBuffer('uint8').buffer

        return calculateVariance(pixels)
    } finally {
        resized.release()
        laplacian16.release()
        laplacianAbs.release()
    }
}

/**
 * Calculates the statistical variance of pixel values.
 *
 * Variance measures how far values are spread from the mean. In this file it is
 * used directly for Laplacian blur scoring and indirectly for contrast scoring.
 *
 * @param pixels Pixel intensity values.
 * @returns Variance of the pixel values.
 */
function calculateVariance(pixels: Uint8Array): number {
    if (pixels.length === 0) {
        return 0
    }

    const mean = calculateAveragePixelValue(pixels)

    const squaredDifferenceTotal = pixels.reduce((sum, value) => {
        const difference = value - mean
        return sum + difference * difference
    }, 0)

    return squaredDifferenceTotal / pixels.length
}

/**
 * Calculates the mean grayscale intensity of an image.
 *
 * In an 8-bit grayscale image, values are normally in the range 0 to 255.
 * Lower values are darker and higher values are brighter.
 *
 * @param source Grayscale image matrix.
 * @returns Average pixel value.
 */
function calculateMean(source: Mat): number {
    return calculateAveragePixelValue(source.toBuffer('uint8').buffer)
}

/**
 * Calculates the standard deviation of grayscale pixel values.
 *
 * Standard deviation is used as a simple contrast score. Higher values usually
 * mean the image has stronger contrast. Lower values usually mean the image is
 * flat, washed out, or visually uninformative.
 *
 * @param source Grayscale image matrix.
 * @returns Standard deviation of pixel values.
 */
function calculateStandardDeviation(source: Mat): number {
    return Math.sqrt(calculateVariance(source.toBuffer('uint8').buffer))
}

/**
 * Calculates a simple average-hash style perceptual hash.
 *
 * The algorithm:
 * 1. Resize the grayscale image to 32 x 32 to reduce noise.
 * 2. Resize it again to 8 x 8.
 * 3. Calculate the average pixel value of the 8 x 8 image.
 * 4. Convert each pixel into a bit:
 *    - `1` if the pixel is greater than or equal to the average
 *    - `0` if the pixel is below the average
 *
 * Similar images should produce similar hashes, even if they are not byte-for-byte
 * identical.
 *
 * @param grayscale Grayscale image matrix.
 * @returns 64-character binary perceptual hash.
 */
function calculatePerceptualHash(grayscale: Mat): string {
    const resizeMat = Mat.create(HASH_RESIZE_SIZE, HASH_RESIZE_SIZE, DataTypes.CV_8U)
    const hashMat = Mat.create(HASH_SIZE, HASH_SIZE, DataTypes.CV_8U)

    try {
        // First resize smooths small details. Second resize creates the final 8 x 8 hash input.
        OpenCV.resize(grayscale, resizeMat, Size.create(HASH_RESIZE_SIZE, HASH_RESIZE_SIZE), 0, 0, 0)
        OpenCV.resize(resizeMat, hashMat, Size.create(HASH_SIZE, HASH_SIZE), 0, 0, 0)

        const pixels = hashMat.toBuffer('uint8').buffer
        const average = calculateAveragePixelValue(pixels)

        return Array.from(pixels)
            .map(value => (value >= average ? '1' : '0'))
            .join('')
    } finally {
        resizeMat.release()
        hashMat.release()
    }
}

/**
 * Calculates the average value of a list of pixels.
 *
 * @param pixels Pixel intensity values.
 * @returns Mean pixel value, or `0` when the input is empty.
 */
function calculateAveragePixelValue(pixels: Uint8Array): number {
    if (pixels.length === 0) {
        return 0
    }

    const total = pixels.reduce((sum, value) => sum + value, 0)

    return total / pixels.length
}
