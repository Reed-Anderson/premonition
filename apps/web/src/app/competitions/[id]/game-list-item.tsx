"use client"

import type { Bet, Game } from "@premonition/types"
import { useState } from "react"
import GameBetForm from "./game-bet-form"

/*******************************************************************************
 *
 * Game List Item
 *
 ******************************************************************************/

type GameListItemProps = {
    game: Game
    initialBet?: Bet
    hasJoined: boolean
}

export default function GameListItem(props: GameListItemProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [placedBet, setPlacedBet] = useState<Bet | null>(
        props.initialBet ?? null,
    )

    return (
        <li className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <button
                type="button"
                onClick={() => setIsExpanded((expanded) => !expanded)}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-black dark:text-zinc-50">
                        {props.game.homeTeam}{" "}
                        <span className="text-zinc-400 dark:text-zinc-600">
                            vs
                        </span>{" "}
                        {props.game.awayTeam}
                    </p>
                    {placedBet && (
                        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                            Bet placed
                        </span>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {formatKickoff(props.game.kickoff)}
                    </p>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 text-zinc-400 transition-transform dark:text-zinc-600 ${isExpanded ? "rotate-180" : ""}`}
                    >
                        <path d="m6 9 6 6 6-6" />
                    </svg>
                </div>
            </button>

            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
                <div className="overflow-hidden">
                    <div className="px-4 pb-4">
                        <GameBetForm
                            game={props.game}
                            initialBet={props.initialBet}
                            hasJoined={props.hasJoined}
                            onPlaceBet={setPlacedBet}
                        />
                    </div>
                </div>
            </div>
        </li>
    )
}

function formatKickoff(kickoff: string) {
    return new Date(kickoff).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    })
}
