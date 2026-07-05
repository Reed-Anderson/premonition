/*******************************************************************************
 *
 * Bet List Item
 *
 ******************************************************************************/

export default function BetListItem({ bet }: { bet: Bet }) {
    return (
        <li className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-black dark:text-zinc-50">
                        {bet.homeTeam}{" "}
                        <span className="text-zinc-400 dark:text-zinc-600">
                            vs
                        </span>{" "}
                        {bet.awayTeam}
                    </p>
                    <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS_NAMES[bet.status]}`}
                    >
                        {STATUS_LABELS[bet.status]}
                    </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {bet.competitionName} &middot; picked{" "}
                    <span className="text-zinc-700 dark:text-zinc-300">
                        {bet.pickedTeam}
                    </span>{" "}
                    &middot; {formatKickoff(bet.kickoff)}
                </p>
            </div>

            <div className="shrink-0 text-right">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {bet.wager.toLocaleString()} credits wagered
                </p>
                <p
                    className={`font-semibold ${RETURN_CLASS_NAMES[bet.status]}`}
                >
                    {returnLabelFor(bet)}
                </p>
            </div>
        </li>
    )
}

export type BetStatus = "pending" | "won" | "lost"

export type Bet = {
    id: string
    competitionName: string
    homeTeam: string
    awayTeam: string
    pickedTeam: string
    wager: number
    potentialReturn: number
    status: BetStatus
    kickoff: string
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

function returnLabelFor(bet: Bet) {
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
