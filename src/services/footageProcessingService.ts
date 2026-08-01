import { imageProcessingConfig } from '@/config/imageProcessingConfig'
import {
    getUnprocessedCandidateFootageItems,
    markFootageItemProcessed,
    markFootageItemSelectedAndProcessed,
} from '@/repositories/footageItemRepository'
import { analyzeImageQuality, areNearDuplicates, isImageBlurry } from '@/services/imageQualityService'
import { FootageItem } from '@/types/footageItem'
import {
    AnalyzedFootageItem,
    ImageProcessingRejectionReason,
    ImageProcessingSummary,
} from '@/types/imageProcessing'

export async function processUnprocessedFootageItems(): Promise<ImageProcessingSummary> {
    const items = await getUnprocessedCandidateFootageItems()

    const summary: ImageProcessingSummary = {
        processed: 0,
        selected: 0,
        rejectedBlurry: 0,
        rejectedNearDuplicate: 0,
        failed: 0,
    }

    const analyzedItems: AnalyzedFootageItem[] = []

    for (const item of items) {
        if (!item.id) {
            summary.failed += 1
            continue
        }

        try {
            const metrics = await analyzeImageQuality(item.fileUri)

            if (isImageBlurry(metrics)) {
                await rejectItem(item.id, 'blurry')
                summary.processed += 1
                summary.rejectedBlurry += 1
                continue
            }

            analyzedItems.push({
                item,
                metrics,
            })
        } catch (error) {
            console.warn(`Failed to analyse footage item ${item.id}:`, error)

            await rejectItem(item.id, getFailureReason(error))
            summary.processed += 1
            summary.failed += 1
        }
    }

    const selectedItems = selectBestRepresentatives(analyzedItems)
    const selectedIds = new Set(
        selectedItems.map(({ item }) => item.id).filter((id): id is string => Boolean(id)),
    )

    for (const analyzedItem of analyzedItems) {
        const itemId = analyzedItem.item.id

        if (!itemId) {
            summary.failed += 1
            continue
        }

        if (selectedIds.has(itemId)) {
            const wasUpdated = await markFootageItemSelectedAndProcessed(itemId)

            if (wasUpdated) {
                summary.selected += 1
                summary.processed += 1
            }

            continue
        }

        const wasUpdated = await rejectItem(itemId, 'near_duplicate')

        if (wasUpdated) {
            summary.rejectedNearDuplicate += 1
            summary.processed += 1
        }
    }

    console.info('Processed footage items', summary)

    return summary
}

function selectBestRepresentatives(items: AnalyzedFootageItem[]): AnalyzedFootageItem[] {
    const groups = groupNearDuplicateItems(items)

    return groups.map(group =>
        group.reduce((bestItem, currentItem) =>
            currentItem.metrics.blurScore > bestItem.metrics.blurScore ? currentItem : bestItem,
        ),
    )
}

function groupNearDuplicateItems(items: AnalyzedFootageItem[]): AnalyzedFootageItem[][] {
    const groups: AnalyzedFootageItem[][] = []

    for (const item of items) {
        const existingGroup = groups.find(group => belongsToGroup(item, group))

        if (existingGroup) {
            existingGroup.push(item)
            continue
        }

        groups.push([item])
    }

    return groups
}

function belongsToGroup(item: AnalyzedFootageItem, group: AnalyzedFootageItem[]): boolean {
    return group.some(groupItem => {
        const isCloseInTime = areItemsCloseInTime(item.item, groupItem.item)
        const isSameCaptureEvent =
            item.item.captureEventId && item.item.captureEventId === groupItem.item.captureEventId
        const isNearDuplicate = areNearDuplicates(
            item.metrics.perceptualHash,
            groupItem.metrics.perceptualHash,
        )

        return (isCloseInTime || isSameCaptureEvent) && isNearDuplicate
    })
}

function areItemsCloseInTime(firstItem: FootageItem, secondItem: FootageItem): boolean {
    const firstTime = new Date(firstItem.createdAt).getTime()
    const secondTime = new Date(secondItem.createdAt).getTime()

    if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) {
        return false
    }

    return Math.abs(firstTime - secondTime) <= imageProcessingConfig.duplicateGroupingWindowMs
}

async function rejectItem(
    footageItemId: string,
    reason: ImageProcessingRejectionReason,
): Promise<boolean> {
    return markFootageItemProcessed(footageItemId, `Rejected by image processing: ${reason}`)
}

function getFailureReason(error: unknown): ImageProcessingRejectionReason {
    const message = error instanceof Error ? error.message.toLowerCase() : ''

    if (message.includes('does not exist')) {
        return 'missing_file'
    }

    if (message.includes('empty')) {
        return 'unreadable_file'
    }

    return 'analysis_failed'
}
