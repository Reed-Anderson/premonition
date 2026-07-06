import BetFilterItem from "./bet-filter-item"
import type { BetStatus } from "./bet-list-item"

/*******************************************************************************
 *
 * Bet Filter
 *
 ******************************************************************************/

type BetFilterProps = {
    selected: BetFilterValue
    onSelect: (value: BetFilterValue) => void
}

export default function BetFilter(props: BetFilterProps) {
    return (
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
            {FILTERS.map((filter) => (
                <BetFilterItem
                    key={filter.value}
                    label={filter.label}
                    isSelected={filter.value === props.selected}
                    onSelect={() => props.onSelect(filter.value)}
                />
            ))}
        </ul>
    )
}

export type BetFilterValue = "all" | BetStatus

const FILTERS: { value: BetFilterValue; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
]
