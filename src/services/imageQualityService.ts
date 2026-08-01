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
    const grayscale = Mat.create()

    OpenCV.cvtColor(source, grayscale, ColorConversionCodes.COLOR_BGR2GRAY)

    return grayscale
}

function calculateLaplacianVariance(grayscale: Mat): number {
    const laplacian = Mat.create()

    try {
        OpenCV.Laplacian(grayscale, laplacian, DataTypes.CV_64F, 1, 1, 0, BorderTypes.BORDER_DEFAULT)

        const stddev = calculateStandardDeviation(laplacian)

        return stddev * stddev
    } finally {
        laplacian.release()
    }
}

function calculateMean(source: Mat): number {
    const mean = Mat.create()
    const stddev = Mat.create()

    try {
        OpenCV.meanStdDev(source, mean, stddev)

        const values = mean.toBuffer('float64')

        return values.buffer[0] ?? 0
    } finally {
        mean.release()
        stddev.release()
    }
}

function calculateStandardDeviation(source: Mat): number {
    const mean = Mat.create()
    const stddev = Mat.create()

    try {
        OpenCV.meanStdDev(source, mean, stddev)

        const values = stddev.toBuffer('float64')

        return values.buffer[0] ?? 0
    } finally {
        mean.release()
        stddev.release()
    }
}

function calculatePerceptualHash(grayscale: Mat): string {
    const resized = Mat.create()

    try {
        OpenCV.resize(grayscale, resized, Size.create(HASH_RESIZE_SIZE, HASH_RESIZE_SIZE), 0, 0, 0)

        const hashImage = Mat.create()

        try {
            OpenCV.resize(resized, hashImage, Size.create(HASH_SIZE, HASH_SIZE), 0, 0, 0)

            const pixels = hashImage.toBuffer('uint8').buffer
            const average = calculateAveragePixelValue(pixels)

            return Array.from(pixels)
                .map(value => (value >= average ? '1' : '0'))
                .join('')
        } finally {
            hashImage.release()
        }
    } finally {
        resized.release()
    }
}

function calculateAveragePixelValue(pixels: Uint8Array): number {
    if (pixels.length === 0) {
        return 0
    }

    const total = pixels.reduce((sum, value) => sum + value, 0)

    return total / pixels.length
}
