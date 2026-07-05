"use client"

import type { Bet, BetOutcome, BetVolume, Game } from "@premonition/types"
import Link from "next/link"
import { useEffect, useState } from "react"
import { googleSignInUrl, UnauthorizedError } from "@/lib/auth"
import {
    BetAlreadyPlacedError,
    estimateMultiplier,
    fetchBetVolume,
    placeBet,
} from "@/lib/bets"
import BetVolumeBar from "./bet-volume-bar"
import OutcomeOption from "./outcome-option"

/*******************************************************************************
 *
 * Game Bet Form
 *
 ******************************************************************************/

export default function GameBetForm({
    game,
    initialBet,
    hasJoined,
    onPlaceBet,
}: {
    game: Game
    initialBet?: Bet
    hasJoined: boolean
    onPlaceBet: (bet: Bet) => void
}) {
    const [outcome, setOutcome] = useState<BetOutcome | null>(
        initialBet?.outcome ?? null,
    )
    const [wager, setWager] = useState(
        initialBet ? String(initialBet.wager) : "",
    )
    const [hasPlacedBet, setHasPlacedBet] = useState(initialBet != null)
    const [isPlacing, setIsPlacing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [volume, setVolume] = useState<BetVolume | null>(null)

    useEffect(() => {
        fetchBetVolume(game.id)
            .then(setVolume)
            .catch(() => { })
    }, [game.id])

    const wagerAmount = Number(wager)
    const homeMultiplier = volume ? estimateMultiplier(volume, "home") : null
    const awayMultiplier = volume ? estimateMultiplier(volume, "away") : null

    /* Once placed, the fetched volume already includes this wager; before that, add it in so the preview reflects the pool as it will be. */
    const volumeAfterThisWager: BetVolume | null =
        volume && outcome && !hasPlacedBet
            ? { ...volume, [outcome]: volume[outcome] + wagerAmount }
            : volume
    const previewMultiplier =
        volumeAfterThisWager && outcome
            ? estimateMultiplier(volumeAfterThisWager, outcome)
            : null
    const potentialReturn =
        previewMultiplier !== null && wagerAmount > 0
            ? wagerAmount * previewMultiplier
            : null

    async function handlePlaceBet() {
        if (!outcome || wagerAmount <= 0) return
        setIsPlacing(true)
        setError(null)
        try {
            const bet = await placeBet(game.id, outcome, wagerAmount)
            setHasPlacedBet(true)
            setVolume((v) =>
                v ? { ...v, [outcome]: v[outcome] + wagerAmount } : v,
            )
            onPlaceBet(bet)
        } catch (err) {
            if (err instanceof UnauthorizedError) {
                window.location.href = googleSignInUrl()
                return
            }
            if (err instanceof BetAlreadyPlacedError) {
                setError("You've already placed a bet on this game.")
                setHasPlacedBet(true)
            } else {
                setError("Couldn't place your bet. Please try again.")
            }
        } finally {
            setIsPlacing(false)
        }
    }

    if (!hasJoined) {
        return (
            <p className="border-t border-zinc-200 pt-3 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <Link
                    href="/competitions"
                    className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                >
                    Join this competition
                </Link>{" "}
                to place bets.
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <div className="flex gap-2">
                <OutcomeOption
                    label={game.homeTeam}
                    multiplier={homeMultiplier}
                    isSelected={outcome === "home"}
                    disabled={hasPlacedBet || isPlacing}
                    onSelect={() => setOutcome("home")}
                />
                <OutcomeOption
                    label={game.awayTeam}
                    multiplier={awayMultiplier}
                    isSelected={outcome === "away"}
                    disabled={hasPlacedBet || isPlacing}
                    onSelect={() => setOutcome("away")}
                />
            </div>

            {volume && (
                <BetVolumeBar
                    volume={volume}
                    homeTeam={game.homeTeam}
                    awayTeam={game.awayTeam}
                />
            )}

            <p className="text-xs text-zinc-400 dark:text-zinc-600">
                Returns will change as more bets are placed.
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0"
                        value={wager}
                        disabled={hasPlacedBet || isPlacing}
                        onChange={(e) =>
                            setWager(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-24 rounded-md border border-zinc-200 px-2 py-1.5 text-sm text-black outline-none focus:border-primary-600 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:disabled:bg-zinc-950 dark:disabled:text-zinc-600"
                    />
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        credits
                    </span>
                </div>

                {potentialReturn !== null && (
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-400">
                        Potential return:{" "}
                        {Math.round(potentialReturn).toLocaleString()} credits
                    </span>
                )}

                <button
                    type="button"
                    disabled={
                        hasPlacedBet || isPlacing || !outcome || wagerAmount <= 0
                    }
                    onClick={handlePlaceBet}
                    className={
                        hasPlacedBet
                            ? "ml-auto shrink-0 cursor-not-allowed rounded-md bg-primary-100 px-4 py-2 text-sm font-medium text-primary-800 dark:bg-primary-950 dark:text-primary-300"
                            : "ml-auto shrink-0 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-primary-600 dark:bg-primary-500 dark:text-black dark:hover:bg-primary-400"
                    }
                >
                    {hasPlacedBet ? "Bet Placed" : isPlacing ? "Placing..." : "Place Bet"}
                </button>
            </div>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    )
}
