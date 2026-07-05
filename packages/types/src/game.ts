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
