/*******************************************************************************
 *
 * Outcome Option
 *
 ******************************************************************************/

type OutcomeOptionProps = {
    label: string
    multiplier: number | null
    isSelected: boolean
    disabled?: boolean
    onSelect: () => void
}

export default function OutcomeOption(props: OutcomeOptionProps) {
    return (
        <button
            type="button"
            onClick={props.onSelect}
            disabled={props.disabled}
            aria-pressed={props.isSelected}
            className={
                props.isSelected
                    ? "flex flex-1 flex-col items-center gap-0.5 rounded-md border border-primary-600 bg-primary-50 px-3 py-2 disabled:opacity-70 dark:border-primary-500 dark:bg-primary-950"
                    : "flex flex-1 flex-col items-center gap-0.5 rounded-md border border-zinc-200 px-3 py-2 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-zinc-800 dark:hover:bg-zinc-900"
            }
        >
            <span className="text-sm font-medium text-black dark:text-zinc-50">
                {props.label}
            </span>
            {props.multiplier !== null && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {props.multiplier.toFixed(2)}x return
                </span>
            )}
        </button>
    )
}
