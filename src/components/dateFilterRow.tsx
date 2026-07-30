import { faArrowDownWideShort, faCalendar, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { colors } from '@/constants/colors'
import { useGalleryDays } from '@/hooks/useGalleryDays'
import { formatDate } from '@/utils/dateUtils'

interface Props {
    imageCount?: number
}

export default function DateFilterRow({ imageCount = 324 }: Props) {
    const { data: galleryDays = [], isLoading, isFetching, error } = useGalleryDays()

    const allowedDates: Date[] = galleryDays.map(day => new Date(day.dayKey))
    const [selected, setSelected] = useState<Date | undefined>(allowedDates[0])

    const sheetRef = useRef<BottomSheetModal>(null)
    const snapPoints = useMemo(() => ['35%'], [])

    const openSheet = () => sheetRef.current?.present()

    const handleSelect = (date: Date) => {
        setSelected(date)
        sheetRef.current?.dismiss()
    }

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
            />
        ),
        [],
    )

    /**
     * Set the newest date, when done fetching them.
     */
    useEffect(() => {
        if (galleryDays.length && !isLoading && !isFetching && !error) {
            setSelected(allowedDates[0])
        }
    }, [galleryDays, isLoading, isFetching, error])

    return (
        <>
            <View className="flex-row items-center justify-between">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={openSheet}
                    className="flex-row items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 py-3"
                >
                    <FontAwesomeIcon icon={faCalendar} size={15} color={colors.onSurfaceVariant} />
                    <Text className="font-atkinson-medium text-[16px] text-on-surface">
                        {selected ? formatDate(selected) : 'Select date'}
                    </Text>
                    <FontAwesomeIcon icon={faChevronDown} size={12} color={colors.onSurfaceVariant} />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.7} className="flex-row items-center gap-2">
                    <Text className="font-atkinson-medium text-[16px] text-on-surface-variant">
                        {imageCount} Images
                    </Text>
                    <FontAwesomeIcon
                        icon={faArrowDownWideShort}
                        size={16}
                        color={colors.onSurfaceVariant}
                    />
                </TouchableOpacity>
            </View>

            <BottomSheetModal
                ref={sheetRef}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: '#FCF9F8' }}
                handleIndicatorStyle={{ backgroundColor: colors.outline }}
            >
                <BottomSheetView className="px-6 pt-2 pb-8">
                    <Text className="mb-4 font-atkinson-bold text-[18px] text-on-surface">
                        Select a date
                    </Text>

                    {!allowedDates.length ? (
                        <Text>No dates</Text>
                    ) : (
                        allowedDates.map((date, index) => {
                            const isSelected = selected
                                ? date.toDateString() === selected.toDateString()
                                : false
                            return (
                                <TouchableOpacity
                                    key={index}
                                    activeOpacity={0.8}
                                    onPress={() => handleSelect(date)}
                                    className={`mb-2 rounded-lg px-5 py-4 ${
                                        isSelected ? 'bg-primary' : 'bg-surface-container-high'
                                    }`}
                                >
                                    <Text
                                        className={`font-atkinson-semibold text-[16px] ${
                                            isSelected ? 'text-on-primary' : 'text-on-surface'
                                        }`}
                                    >
                                        {formatDate(date)}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })
                    )}
                </BottomSheetView>
            </BottomSheetModal>
        </>
    )
}
