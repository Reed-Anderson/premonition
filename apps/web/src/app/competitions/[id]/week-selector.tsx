import WeekSelectorItem from "./week-selector-item"

/*******************************************************************************
 *
 * Week Selector
 *
 ******************************************************************************/

type WeekSelectorProps = {
    weeks: number[]
    selectedWeek: number
    onSelectWeek: (week: number) => void
}

export default function WeekSelector(props: WeekSelectorProps) {
    return (
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
            {props.weeks.map((week) => (
                <WeekSelectorItem
                    key={week}
                    week={week}
                    isSelected={week === props.selectedWeek}
                    onSelect={() => props.onSelectWeek(week)}
                />
            ))}
        </ul>
    )
}
