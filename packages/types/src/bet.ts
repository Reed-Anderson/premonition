export type BetOutcome = "home" | "away" | "tie"

export type Bet = {
    id: string
    userId: string
    gameId: string
    outcome: BetOutcome
    wager: number
    placedAt: string
}

/* Total credits wagered on each outcome of a game, e.g. for a bet-slip volume bar. */
export type BetVolume = {
    home: number
    away: number
    tie: number
}

/* Fraction (0-1) of total volume on each outcome; all 0 when nothing has been wagered yet. */
export function getBetVolumeShare(volume: BetVolume): {
    home: number
    away: number
    tie: number
} {
    const total = volume.home + volume.away + volume.tie
    if (total === 0) {
        return { home: 0, away: 0, tie: 0 }
    }
    return {
        home: volume.home / total,
        away: volume.away / total,
        tie: volume.tie / total,
    }
}

/*
 * Pari-mutuel estimate: winners split the whole pool in proportion to their
 * stake on the winning side. Based on volume as it currently stands, so it's
 * only an estimate — it moves as more bets come in, and for a bet already
 * won/lost it approximates the payout using live volume since nothing freezes
 * the pool at resolution time. Null when nobody (not even the house) has bet
 * on that outcome yet.
 */
export function estimateMultiplier(
    volume: BetVolume,
    outcome: BetOutcome,
): number | null {
    const total = volume.home + volume.away + volume.tie
    const onOutcome = volume[outcome]
    if (onOutcome <= 0) {
        return null
    }
    return total / onOutcome
}

export type BetStatus = "pending" | "won" | "lost"

/* A bet enriched with its game/competition context and a computed status + return, e.g. for a "my bets" list. */
export type BetSummary = {
    id: string
    gameId: string
    competitionId: string
    competitionName: string
    homeTeam: string
    awayTeam: string
    outcome: BetOutcome
    wager: number
    potentialReturn: number
    status: BetStatus
    kickoff: string
}
