import LeaderboardRow from "./leaderboard-row"

/*******************************************************************************
 *
 * Leaderboard Page
 *
 ******************************************************************************/

export default function LeaderboardPage() {
    const currentUserEntry = LEADERBOARD_ENTRIES.find(
        (entry) => entry.isCurrentUser,
    )

    return (
        <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
            <main className="flex w-full max-w-xl flex-col gap-6">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
                        Leaderboard
                    </h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        See how you stack up against other players.
                    </p>
                </div>

                {currentUserEntry && (
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-900 dark:bg-primary-950/40">
                        <div>
                            <p className="text-sm text-primary-700 dark:text-primary-300">
                                Your rank
                            </p>
                            <p className="text-2xl font-semibold text-black dark:text-zinc-50">
                                #{currentUserEntry.rank}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-primary-700 dark:text-primary-300">
                                Your credits
                            </p>
                            <p className="text-2xl font-semibold text-black dark:text-zinc-50">
                                {currentUserEntry.credits.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

                <ul className="flex flex-col gap-3">
                    {LEADERBOARD_ENTRIES.map((entry) => (
                        <LeaderboardRow key={entry.rank} entry={entry} />
                    ))}
                </ul>
            </main>
        </div>
    )
}

/* Hardcoded until the API exposes standings for a competition. */
const LEADERBOARD_ENTRIES = [
    { rank: 1, name: "Jordan Lee", credits: 8920 },
    { rank: 2, name: "Sam Rivera", credits: 8340 },
    { rank: 3, name: "Taylor Chen", credits: 7960 },
    { rank: 4, name: "Morgan Blake", credits: 6510 },
    { rank: 5, name: "Priya Patel", credits: 5980 },
    { rank: 6, name: "Alex Morgan", credits: 2450, isCurrentUser: true },
    { rank: 7, name: "Chris Nguyen", credits: 2110 },
    { rank: 8, name: "Jamie Ortiz", credits: 1875 },
    { rank: 9, name: "Drew Kim", credits: 1420 },
    { rank: 10, name: "Casey Fox", credits: 980 },
]
