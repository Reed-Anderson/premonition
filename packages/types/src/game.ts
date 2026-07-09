import type { BetOutcome } from "./bet"

export type Game = {
    id: string
    competitionId: string
    week: number
    homeTeam: string
    awayTeam: string
    kickoff: string
    homeScore: number | null
    awayScore: number | null
}

/* The actual result of a game, derived from its own scores; null while either score is still unset. */
export function gameOutcome(
    game: Pick<Game, "homeScore" | "awayScore">,
): BetOutcome | null {
    if (game.homeScore === null || game.awayScore === null) {
        return null
    }
    if (game.homeScore > game.awayScore) {
        return "home"
    }
    if (game.homeScore < game.awayScore) {
        return "away"
    }
    return "tie"
}
