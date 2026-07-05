/*******************************************************************************
 *
 * Leaderboard Row
 *
 ******************************************************************************/

export default function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
    return (
        <li
            className={`flex items-center gap-4 rounded-lg border p-4 ${
                entry.isCurrentUser
                    ? "border-primary-300 bg-primary-50 dark:border-primary-800 dark:bg-primary-950/40"
                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            }`}
        >
            <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${rankBadgeClassName(entry.rank)}`}
            >
                {entry.rank}
            </span>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white dark:bg-primary-500 dark:text-black">
                {initialsFor(entry.name)}
            </span>

            <p className="min-w-0 grow truncate font-medium text-black dark:text-zinc-50">
                {entry.name}
                {entry.isCurrentUser && (
                    <span className="ml-2 text-xs font-normal text-primary-700 dark:text-primary-300">
                        (You)
                    </span>
                )}
            </p>

            <p className="shrink-0 text-right font-semibold text-black dark:text-zinc-50">
                {entry.credits.toLocaleString()}{" "}
                <span className="font-normal text-zinc-500 dark:text-zinc-400">
                    credits
                </span>
            </p>
        </li>
    )
}

export type LeaderboardEntry = {
    rank: number
    name: string
    credits: number
    isCurrentUser?: boolean
}

function rankBadgeClassName(rank: number) {
    switch (rank) {
        case 1:
            return "bg-secondary-400 text-secondary-950 dark:bg-secondary-400 dark:text-secondary-950"
        case 2:
            return "bg-zinc-300 text-zinc-800 dark:bg-zinc-600 dark:text-zinc-100"
        case 3:
            return "bg-secondary-700 text-white dark:bg-secondary-800 dark:text-secondary-100"
        default:
            return "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
    }
}

function initialsFor(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
}
