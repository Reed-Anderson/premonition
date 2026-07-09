import type { Bet, BetOutcome, BetSummary, BetVolume } from "@premonition/types"
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

/* All of the signed-in user's bets across every competition, enriched with game/competition context and a computed status + return. Resolves to an empty list when signed out. */
export async function fetchAllMyBets(): Promise<BetSummary[]> {
    const res = await fetch(`${API_URL}/bets/mine`, {
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

/* Cancels the signed-in user's bet on a game, freeing them to place a new one. */
export async function cancelBet(gameId: string): Promise<void> {
    const res = await fetch(`${API_URL}/games/${gameId}/bets`, {
        method: "DELETE",
        credentials: "include",
    })
    if (res.status === 401) {
        throw new UnauthorizedError()
    }
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
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
