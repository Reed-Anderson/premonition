"use client"

import type { Bet, Competition, Game } from "@premonition/types"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import SportIcon from "@/components/icons/sport-icon"
import { fetchMyBets } from "@/lib/bets"
import { fetchCompetition, fetchMyCompetitionIds } from "@/lib/competitions"
import { formatDate } from "@/lib/dates"
import { fetchGames, groupGamesByWeek } from "@/lib/games"
import GameListItem from "./game-list-item"
import WeekSelector from "./week-selector"

/*******************************************************************************
 *
 * Competition Details Page
 *
 ******************************************************************************/

export default function CompetitionDetailsPage() {
    /***************************************************************************
     * State
     **************************************************************************/

    const { id } = useParams<{ id: string }>()
    const [competition, setCompetition] = useState<Competition | null>(null)
    const [games, setGames] = useState<Game[]>([])
    const [hasJoined, setHasJoined] = useState(false)
    const [bets, setBets] = useState<Bet[]>([])
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    /***************************************************************************
     * Effects
     **************************************************************************/

    useEffect(() => {
        Promise.all([
            fetchCompetition(id),
            fetchGames(id),
            fetchMyCompetitionIds(),
            fetchMyBets(id),
        ])
            .then(([competition, games, myCompetitionIds, bets]) => {
                setCompetition(competition)
                setGames(games)
                setHasJoined(myCompetitionIds.includes(id))
                setBets(bets)
                setSelectedWeek(groupGamesByWeek(games).at(0)?.week ?? null)
            })
            .catch(() => {
                setError("Couldn't load this competition. Please try again.")
            })
            .finally(() => setLoading(false))
    }, [id])

    /***************************************************************************
     * Render Variables
     **************************************************************************/

    const weeks = groupGamesByWeek(games)
    const selectedWeekGames =
        weeks.find((w) => w.week === selectedWeek)?.games ?? []
    const betsByGameId = new Map(bets.map((bet) => [bet.gameId, bet]))

    /***************************************************************************
     * Render
     **************************************************************************/

    return (
        <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
            <main className="flex w-full max-w-xl flex-col gap-8">
                {loading && (
                    <p className="text-center text-zinc-500 dark:text-zinc-400">
                        Loading competition...
                    </p>
                )}

                {error && (
                    <p className="text-center text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}

                {!loading && !error && competition && (
                    <>
                        <div className="text-center">
                            <h1 className="flex items-center justify-center gap-2 text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
                                <SportIcon
                                    sport={competition.sport}
                                    className="h-7 w-7 shrink-0 text-primary-600 dark:text-primary-400"
                                />
                                {competition.name}
                            </h1>
                            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                                {formatDate(competition.startDate)} –{" "}
                                {formatDate(competition.endDate)}
                            </p>
                        </div>

                        {weeks.length === 0 && (
                            <p className="text-center text-zinc-500 dark:text-zinc-400">
                                No games scheduled yet.
                            </p>
                        )}

                        {selectedWeek !== null && (
                            <div className="flex flex-col gap-4">
                                <WeekSelector
                                    weeks={weeks.map((w) => w.week)}
                                    selectedWeek={selectedWeek}
                                    onSelectWeek={setSelectedWeek}
                                />
                                <ul className="flex flex-col gap-3">
                                    {selectedWeekGames.map((game) => (
                                        <GameListItem
                                            key={game.id}
                                            game={game}
                                            initialBet={betsByGameId.get(game.id)}
                                            hasJoined={hasJoined}
                                        />
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
