import BetFilterItem from "./bet-filter-item"
import type { BetStatus } from "./bet-list-item"

/*******************************************************************************
 *
 * Bet Filter
 *
 ******************************************************************************/

export default function BetFilter({
    selected,
    onSelect,
}: {
    selected: BetFilterValue
    onSelect: (value: BetFilterValue) => void
}) {
    return (
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
            {FILTERS.map((filter) => (
                <BetFilterItem
                    key={filter.value}
                    label={filter.label}
                    isSelected={filter.value === selected}
                    onSelect={() => onSelect(filter.value)}
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
