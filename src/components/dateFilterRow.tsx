import { faArrowDownWideShort, faCalendar, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useCallback, useMemo, useRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { colors } from '@/constants/colors'
import { formatDate } from '@/utils/dateUtils'

interface Props {
    imageCount?: number
}

export default function DateFilterRow({ imageCount = 324 }: Props) {
    const allowedDates: Date[] = [
        new Date(),
        new Date(Date.now() - 86400000),
        new Date(Date.now() - 172800000),
    ]

    const [selected, setSelected] = useState<Date>(allowedDates[0])

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
                        {formatDate(selected)}
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

                    {allowedDates.map((date, index) => {
                        const isSelected = date.toDateString() === selected.toDateString()
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
                    })}
                </BottomSheetView>
            </BottomSheetModal>
        </>
    )
}
