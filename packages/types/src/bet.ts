export type BetOutcome = "home" | "away"

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
}

/* Fraction (0-1) of total volume on each side; both 0 when nothing has been wagered yet. */
export function getBetVolumeShare(volume: BetVolume): {
    home: number
    away: number
} {
    const total = volume.home + volume.away
    if (total === 0) {
        return { home: 0, away: 0 }
    }
    return { home: volume.home / total, away: volume.away / total }
}
