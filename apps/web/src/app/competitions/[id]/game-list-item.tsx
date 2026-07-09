"use client"

import type { Bet, Game, Sport } from "@premonition/types"
import { useEffect, useRef, useState } from "react"
import GameBetForm from "./game-bet-form"

/*******************************************************************************
 *
 * Game List Item
 *
 ******************************************************************************/

type GameListItemProps = {
    game: Game
    sport: Sport
    initialBet?: Bet
    hasJoined: boolean
    highlighted?: boolean
}

export default function GameListItem(props: GameListItemProps) {
    /***************************************************************************
     * State
     **************************************************************************/

    const [isExpanded, setIsExpanded] = useState(props.highlighted ?? false)
    const [placedBet, setPlacedBet] = useState<Bet | null>(
        props.initialBet ?? null,
    )
    const [showHighlight, setShowHighlight] = useState(props.highlighted ?? false)
    const itemRef = useRef<HTMLLIElement>(null)

    /***************************************************************************
     * Effects
     **************************************************************************/

    useEffect(() => {
        if (!props.highlighted) {
            return
        }
        itemRef.current?.scrollIntoView({ block: "center", behavior: "smooth" })
        setShowHighlight(true)
        const timeout = setTimeout(() => setShowHighlight(false), 3000)
        return () => clearTimeout(timeout)
    }, [props.highlighted])

    /***************************************************************************
     * Render
     **************************************************************************/

    return (
        <li
            ref={itemRef}
            className={`overflow-hidden rounded-lg border bg-white transition-colors duration-1000 dark:bg-zinc-950 ${
                showHighlight
                    ? "border-primary-400 ring-1 ring-primary-400 dark:border-primary-600 dark:ring-primary-600"
                    : "border-zinc-200 dark:border-zinc-800"
            }`}
        >
            <button
                type="button"
                onClick={() => setIsExpanded((expanded) => !expanded)}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-black dark:text-zinc-50">
                        <span className={outcomeClassName(placedBet?.outcome, "home")}>
                            {props.game.homeTeam}
                        </span>{" "}
                        <span className="text-zinc-400 dark:text-zinc-600">
                            vs
                        </span>{" "}
                        <span className={outcomeClassName(placedBet?.outcome, "away")}>
                            {props.game.awayTeam}
                        </span>
                    </p>
                    {placedBet && (
                        <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-950 dark:text-primary-300">
                            {placedBet.wager.toLocaleString()} credits
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
                            sport={props.sport}
                            initialBet={props.initialBet}
                            hasJoined={props.hasJoined}
                            onPlaceBet={setPlacedBet}
                            onCancelBet={() => setPlacedBet(null)}
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

/* A tie pick highlights both teams in secondary color; a home/away pick highlights just that side in primary color. */
function outcomeClassName(outcome: Bet["outcome"] | undefined, side: "home" | "away") {
    if (outcome === "tie") {
        return "text-secondary-700 dark:text-secondary-400"
    }
    if (outcome === side) {
        return "text-primary-700 dark:text-primary-400"
    }
    return undefined
}
