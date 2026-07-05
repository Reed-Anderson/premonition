import type { Bet, BetOutcome, BetVolume } from "@premonition/types"
import { UnauthorizedError } from "./auth"

/*******************************************************************************
 *
 * Bets API
 *
 ******************************************************************************/

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

/* Thrown when the server rejects a second bet on the same game. */
export class BetAlreadyPlacedError extends Error {
    constructor() {
        super("Bet already placed")
        this.name = "BetAlreadyPlacedError"
    }
}

/* Resolves to an empty list rather than throwing when signed out, since that just means "no bets placed". */
export async function fetchMyBets(competitionId: string): Promise<Bet[]> {
    const res = await fetch(`${API_URL}/competitions/${competitionId}/bets/mine`, {
        credentials: "include",
    })
    if (res.status === 401) {
        return []
    }
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}

export async function fetchBetVolume(gameId: string): Promise<BetVolume> {
    const res = await fetch(`${API_URL}/games/${gameId}/bets/volume`)
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}

/*
 * Pari-mutuel estimate: winners split the whole pool in proportion to their
 * stake on the winning side. Based on volume as it currently stands, so it's
 * only an estimate for a bet not yet placed — it moves as more bets come in.
 * Null when nobody (not even the house) has bet on that outcome yet.
 */
export function estimateMultiplier(
    volume: BetVolume,
    outcome: BetOutcome,
): number | null {
    const total = volume.home + volume.away
    const onOutcome = volume[outcome]
    if (onOutcome <= 0) {
        return null
    }
    return total / onOutcome
}

export async function placeBet(
    gameId: string,
    outcome: BetOutcome,
    wager: number,
): Promise<Bet> {
    const res = await fetch(`${API_URL}/games/${gameId}/bets`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, wager }),
    })
    if (res.status === 401) {
        throw new UnauthorizedError()
    }
    if (res.status === 409) {
        throw new BetAlreadyPlacedError()
    }
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}
