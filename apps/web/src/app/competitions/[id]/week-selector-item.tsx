/*******************************************************************************
 *
 * Week Selector Item
 *
 ******************************************************************************/

type WeekSelectorItemProps = {
    week: number
    isSelected: boolean
    onSelect: () => void
}

export default function WeekSelectorItem(props: WeekSelectorItemProps) {
    return (
        <li className="shrink-0 snap-start">
            <button
                type="button"
                onClick={props.onSelect}
                aria-current={props.isSelected}
                className={
                    props.isSelected
                        ? "rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white dark:bg-primary-500 dark:text-black"
                        : "rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                }
            >
                Week {props.week}
            </button>
        </li>
    )
}
