import { imageProcessingConfig } from '@/config/imageProcessingConfig'
import {
    getUnprocessedCandidateFootageItems,
    markFootageItemProcessed,
    markFootageItemSelectedAndProcessed,
} from '@/repositories/footageItemRepository'
import {
    analyzeImageQuality,
    areNearDuplicates,
    hasLowQuality,
    isImageBlurry,
} from '@/services/imageQualityService'
import { FootageItem } from '@/types/footageItem'
import {
    AnalyzedFootageItem,
    ImageProcessingRejectionReason,
    ImageProcessingSummary,
} from '@/types/imageProcessing'

/**
 * Processes all unprocessed candidate footage items.
 *
 * Each item is analysed for blur, general quality, and near-duplicate content.
 * Low-quality items are rejected, while the best representative from each duplicate group is selected.
 *
 * @returns A summary of how many footage items were processed, selected, rejected, or failed.
 */
export async function processUnprocessedFootageItems(): Promise<ImageProcessingSummary> {
    const items = await getUnprocessedCandidateFootageItems()

    const summary: ImageProcessingSummary = {
        processed: 0,
        selected: 0,
        rejectedBlurry: 0,
        rejectedNearDuplicate: 0,
        failed: 0,
        rejectedLowQuality: 0,
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

            if (hasLowQuality(metrics)) {
                await rejectItem(item.id, 'low_quality')
                summary.processed += 1
                summary.rejectedLowQuality += 1
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

/**
 * Selects the highest-quality item from each near-duplicate group.
 *
 * The item with the highest blur score is treated as the clearest representative.
 *
 * @param items - Analysed footage items that passed the first quality checks.
 * @returns One representative item for each duplicate group.
 */
function selectBestRepresentatives(items: AnalyzedFootageItem[]): AnalyzedFootageItem[] {
    const groups = groupNearDuplicateItems(items)

    return groups.map(group =>
        group.reduce((bestItem, currentItem) =>
            currentItem.metrics.blurScore > bestItem.metrics.blurScore ? currentItem : bestItem,
        ),
    )
}

/**
 * Groups analysed footage items that appear to represent the same moment or scene.
 *
 * Items are grouped when they share a capture event, or when they are close in time and visually similar.
 *
 * @param items - Analysed footage items to group.
 * @returns Groups of near-duplicate footage items.
 */
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

/**
 * Checks whether a footage item belongs in an existing near-duplicate group.
 *
 * @param item - The analysed item to compare.
 * @param group - The existing group to compare against.
 * @returns True when the item matches at least one item in the group.
 */
function belongsToGroup(item: AnalyzedFootageItem, group: AnalyzedFootageItem[]): boolean {
    return group.some(groupItem => {
        const isCloseInTime = areItemsCloseInTime(item.item, groupItem.item)
        const isSameCaptureEvent =
            item.item.captureEventId !== null &&
            item.item.captureEventId === groupItem.item.captureEventId
        const isNearDuplicate = areNearDuplicates(
            item.metrics.perceptualHash,
            groupItem.metrics.perceptualHash,
        )

        if (isSameCaptureEvent) {
            return true
        }

        return isCloseInTime && isNearDuplicate
    })
}

/**
 * Checks whether two footage items were captured within the duplicate grouping window.
 *
 * @param firstItem - The first footage item to compare.
 * @param secondItem - The second footage item to compare.
 * @returns True when both dates are valid and close enough in time.
 */
function areItemsCloseInTime(firstItem: FootageItem, secondItem: FootageItem): boolean {
    const firstTime = new Date(firstItem.createdAt).getTime()
    const secondTime = new Date(secondItem.createdAt).getTime()

    if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) {
        return false
    }

    return Math.abs(firstTime - secondTime) <= imageProcessingConfig.duplicateGroupingWindowMs
}

/**
 * Marks a footage item as processed with a rejection reason.
 *
 * @param footageItemId - The footage item id to reject.
 * @param reason - The reason why the item was rejected.
 * @returns True when the repository update succeeds.
 */
async function rejectItem(
    footageItemId: string,
    reason: ImageProcessingRejectionReason,
): Promise<boolean> {
    return markFootageItemProcessed(footageItemId, `Rejected by image processing: ${reason}`)
}

/**
 * Converts an analysis error into a stored image processing rejection reason.
 *
 * @param error - The thrown analysis error.
 * @returns The rejection reason that best matches the failure.
 */
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
