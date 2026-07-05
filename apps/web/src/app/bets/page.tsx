"use client"

import { useState } from "react"
import BetFilter, { type BetFilterValue } from "./bet-filter"
import BetListItem, { type Bet } from "./bet-list-item"

/*******************************************************************************
 *
 * My Bets Page
 *
 ******************************************************************************/

export default function MyBetsPage() {
    /***************************************************************************
     * State
     **************************************************************************/

    const [filter, setFilter] = useState<BetFilterValue>("all")

    const bets =
        filter === "all" ? BETS : BETS.filter((bet) => bet.status === filter)

    const pendingWagered = BETS.filter(
        (bet) => bet.status === "pending",
    ).reduce((total, bet) => total + bet.wager, 0)
    const netCredits = BETS.reduce((total, bet) => {
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
            </main>
        </div>
    )
}

/* Hardcoded until bet history is fetched from the API. */
const BETS: Bet[] = [
    {
        id: "bet-1",
        competitionName: "2026 FIFA World Cup",
        homeTeam: "Mexico",
        awayTeam: "South Korea",
        pickedTeam: "Mexico",
        wager: 150,
        potentialReturn: 270,
        status: "pending",
        kickoff: "2026-06-11T19:00:00Z",
    },
    {
        id: "bet-2",
        competitionName: "2026 FIFA World Cup",
        homeTeam: "USA",
        awayTeam: "Wales",
        pickedTeam: "USA",
        wager: 200,
        potentialReturn: 360,
        status: "won",
        kickoff: "2026-06-12T21:00:00Z",
    },
    {
        id: "bet-3",
        competitionName: "2026/27 NFL",
        homeTeam: "Kansas City Chiefs",
        awayTeam: "Buffalo Bills",
        pickedTeam: "Buffalo Bills",
        wager: 100,
        potentialReturn: 210,
        status: "lost",
        kickoff: "2026-09-10T20:20:00Z",
    },
    {
        id: "bet-4",
        competitionName: "2026/27 English Premier League",
        homeTeam: "Arsenal",
        awayTeam: "Manchester City",
        pickedTeam: "Arsenal",
        wager: 75,
        potentialReturn: 135,
        status: "pending",
        kickoff: "2026-08-15T14:00:00Z",
    },
]
