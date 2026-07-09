"use client"

import type { BetSummary } from "@premonition/types"
import { useEffect, useState } from "react"
import { fetchAllMyBets } from "@/lib/bets"
import BetFilter, { type BetFilterValue } from "./bet-filter"
import BetListItem from "./bet-list-item"

/*******************************************************************************
 *
 * My Bets Page
 *
 ******************************************************************************/

export default function MyBetsPage() {
    /***************************************************************************
     * State
     **************************************************************************/

    const [allBets, setAllBets] = useState<BetSummary[]>([])
    const [filter, setFilter] = useState<BetFilterValue>("all")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    /***************************************************************************
     * Effects
     **************************************************************************/

    useEffect(() => {
        fetchAllMyBets()
            .then(setAllBets)
            .catch(() => setError("Couldn't load your bets. Please try again."))
            .finally(() => setLoading(false))
    }, [])

    /***************************************************************************
     * Render Variables
     **************************************************************************/

    const bets =
        filter === "all"
            ? allBets
            : allBets.filter((bet) => bet.status === filter)

    const pendingWagered = allBets
        .filter((bet) => bet.status === "pending")
        .reduce((total, bet) => total + bet.wager, 0)
    const netCredits = allBets.reduce((total, bet) => {
        if (bet.status === "won") {
            return total + bet.potentialReturn
        }
        if (bet.status === "lost") {
            return total - bet.wager
        }
        return total
    }, 0)

    /***************************************************************************
     * Render
     **************************************************************************/

    return (
        <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
            <main className="flex w-full max-w-xl flex-col gap-6">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
                        My Bets
                    </h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        Track every prediction you&apos;ve made across all
                        competitions.
                    </p>
                </div>

                {loading && (
                    <p className="text-center text-zinc-500 dark:text-zinc-400">
                        Loading your bets...
                    </p>
                )}

                {error && (
                    <p className="text-center text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}

                {!loading && !error && (
                    <>
                        <div className="flex items-center justify-between gap-4 rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-900 dark:bg-primary-950/40">
                            <div>
                                <p className="text-sm text-primary-700 dark:text-primary-300">
                                    Pending wagers
                                </p>
                                <p className="text-2xl font-semibold text-black dark:text-zinc-50">
                                    {pendingWagered.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-primary-700 dark:text-primary-300">
                                    Net credits (resolved)
                                </p>
                                <p className="text-2xl font-semibold text-black dark:text-zinc-50">
                                    {netCredits >= 0 ? "+" : ""}
                                    {netCredits.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <BetFilter selected={filter} onSelect={setFilter} />

                        {bets.length === 0 && (
                            <p className="text-center text-zinc-500 dark:text-zinc-400">
                                No bets to show here yet.
                            </p>
                        )}

                        {bets.length > 0 && (
                            <ul className="flex flex-col gap-3">
                                {bets.map((bet) => (
                                    <BetListItem key={bet.id} bet={bet} />
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
