import WeekSelectorItem from "./week-selector-item"

/*******************************************************************************
 *
 * Week Selector
 *
 ******************************************************************************/

export default function WeekSelector({
    weeks,
    selectedWeek,
    onSelectWeek,
}: {
    weeks: number[]
    selectedWeek: number
    onSelectWeek: (week: number) => void
}) {
    return (
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
            {weeks.map((week) => (
                <WeekSelectorItem
                    key={week}
                    week={week}
                    isSelected={week === selectedWeek}
                    onSelect={() => onSelectWeek(week)}
                />
            ))}
        </ul>
    )
}
