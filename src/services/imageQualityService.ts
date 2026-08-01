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

const HASH_SIZE = 8
const HASH_RESIZE_SIZE = 32

export async function analyzeImageQuality(fileUri: string): Promise<ImageQualityMetrics> {
    const base64 = await readImageAsBase64(fileUri)
    const source = Mat.createFromBase64(base64)

    try {
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

export function isImageBlurry(metrics: ImageQualityMetrics): boolean {
    return metrics.blurScore < imageProcessingConfig.blurVarianceThreshold
}

export function hasLowQuality(metrics: ImageQualityMetrics): boolean {
    return metrics.contrastScore < imageProcessingConfig.lowContrastThreshold
}

export function getHashDistance(firstHash: string, secondHash: string): number {
    const length = Math.min(firstHash.length, secondHash.length)
    let distance = Math.abs(firstHash.length - secondHash.length)

    for (let index = 0; index < length; index += 1) {
        if (firstHash[index] !== secondHash[index]) {
            distance += 1
        }
    }

    return distance
}

export function areNearDuplicates(firstHash: string, secondHash: string): boolean {
    return getHashDistance(firstHash, secondHash) <= imageProcessingConfig.duplicateHashDistanceThreshold
}

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

function toGrayscale(source: Mat): Mat {
    const sourceBuffer = source.toBuffer('uint8')
    const grayscale = Mat.create(sourceBuffer.rows, sourceBuffer.cols, DataTypes.CV_8U)

    if (sourceBuffer.channels === 1) {
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

    grayscale.release()

    throw new Error(`Unsupported image channel count: ${sourceBuffer.channels}`)
}

function calculateLaplacianVariance(grayscale: Mat): number {
    const targetWidth = 640
    const targetHeight = 360

    const resized = Mat.create(targetHeight, targetWidth, DataTypes.CV_8U)

    const laplacian16 = Mat.create(targetHeight, targetWidth, DataTypes.CV_16S)
    const laplacianAbs = Mat.create(targetHeight, targetWidth, DataTypes.CV_8U)

    try {
        OpenCV.resize(grayscale, resized, Size.create(targetWidth, targetHeight), 0, 0, 0)
        OpenCV.Laplacian(resized, laplacian16, DataTypes.CV_16S, 3, 1, 0, BorderTypes.BORDER_DEFAULT)
        OpenCV.convertScaleAbs(laplacian16, laplacianAbs)

        const pixels = laplacianAbs.toBuffer('uint8').buffer
        const variance = calculateVariance(pixels)

        return variance
    } finally {
        resized.release()
        laplacian16.release()
        laplacianAbs.release()
    }
}

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

function calculateMean(source: Mat): number {
    return calculateAveragePixelValue(source.toBuffer('uint8').buffer)
}

function calculateStandardDeviation(source: Mat): number {
    return Math.sqrt(calculateVariance(source.toBuffer('uint8').buffer))
}

function calculatePerceptualHash(grayscale: Mat): string {
    const resizeMat = Mat.create(HASH_RESIZE_SIZE, HASH_RESIZE_SIZE, DataTypes.CV_8U)
    const hashMat = Mat.create(HASH_SIZE, HASH_SIZE, DataTypes.CV_8U)

    try {
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

function calculateAveragePixelValue(pixels: Uint8Array): number {
    if (pixels.length === 0) {
        return 0
    }

    const total = pixels.reduce((sum, value) => sum + value, 0)

    return total / pixels.length
}
