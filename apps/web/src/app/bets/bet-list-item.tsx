import type { BetOutcome, BetStatus, BetSummary } from "@premonition/types"

/*******************************************************************************
 *
 * Bet List Item
 *
 ******************************************************************************/

type BetListItemProps = {
    bet: BetSummary
}

export default function BetListItem(props: BetListItemProps) {
    const pickedLabel = pickedLabelFor(props.bet)

    return (
        <li className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-black dark:text-zinc-50">
                        <span className={outcomeClassName(props.bet.outcome, "home")}>
                            {props.bet.homeTeam}
                        </span>{" "}
                        <span className="text-zinc-400 dark:text-zinc-600">
                            vs
                        </span>{" "}
                        <span className={outcomeClassName(props.bet.outcome, "away")}>
                            {props.bet.awayTeam}
                        </span>
                    </p>
                    <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS_NAMES[props.bet.status]}`}
                    >
                        {STATUS_LABELS[props.bet.status]}
                    </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {props.bet.competitionName} &middot; picked{" "}
                    <span
                        className={`font-medium ${
                            props.bet.outcome === "tie"
                                ? "text-secondary-700 dark:text-secondary-400"
                                : "text-primary-700 dark:text-primary-400"
                        }`}
                    >
                        {pickedLabel}
                    </span>{" "}
                    &middot; {formatKickoff(props.bet.kickoff)}
                </p>
            </div>

            <div className="shrink-0 text-right">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {props.bet.wager.toLocaleString()} credits wagered
                </p>
                <p
                    className={`font-semibold ${RETURN_CLASS_NAMES[props.bet.status]}`}
                >
                    {returnLabelFor(props.bet)}
                </p>
            </div>
        </li>
    )
}

function pickedLabelFor(bet: BetSummary) {
    switch (bet.outcome) {
        case "home":
            return bet.homeTeam
        case "away":
            return bet.awayTeam
        case "tie":
            return "Tie"
    }
}

/* A tie pick highlights both teams in secondary color; a home/away pick highlights just that side in primary color. */
function outcomeClassName(outcome: BetOutcome, side: "home" | "away") {
    if (outcome === "tie") {
        return "text-secondary-700 dark:text-secondary-400"
    }
    if (outcome === side) {
        return "text-primary-700 dark:text-primary-400"
    }
    return undefined
}

const STATUS_LABELS: Record<BetStatus, string> = {
    pending: "Pending",
    won: "Won",
    lost: "Lost",
}

const STATUS_BADGE_CLASS_NAMES: Record<BetStatus, string> = {
    pending:
        "bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300",
    won: "bg-secondary-100 text-secondary-800 dark:bg-secondary-950 dark:text-secondary-300",
    lost: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400",
}

const RETURN_CLASS_NAMES: Record<BetStatus, string> = {
    pending: "text-zinc-500 dark:text-zinc-400",
    won: "text-secondary-700 dark:text-secondary-400",
    lost: "text-zinc-400 dark:text-zinc-600",
}

function returnLabelFor(bet: BetSummary) {
    switch (bet.status) {
        case "pending":
            return `Potential: ${bet.potentialReturn.toLocaleString()} credits`
        case "won":
            return `+${bet.potentialReturn.toLocaleString()} credits`
        case "lost":
            return `-${bet.wager.toLocaleString()} credits`
    }
}

function formatKickoff(kickoff: string) {
    return new Date(kickoff).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    })
}
