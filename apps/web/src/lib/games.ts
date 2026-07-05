import type { Game } from "@premonition/types"

/*******************************************************************************
 *
 * Games API
 *
 ******************************************************************************/

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function fetchGames(competitionId: string): Promise<Game[]> {
    const res = await fetch(`${API_URL}/competitions/${competitionId}/games`)
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}

export function groupGamesByWeek(
    games: Game[],
): { week: number; games: Game[] }[] {
    const weeks = new Map<number, Game[]>()
    for (const game of games) {
        const gamesInWeek = weeks.get(game.week) ?? []
        gamesInWeek.push(game)
        weeks.set(game.week, gamesInWeek)
    }
    return [...weeks.entries()]
        .sort(([a], [b]) => a - b)
        .map(([week, games]) => ({ week, games }))
}
