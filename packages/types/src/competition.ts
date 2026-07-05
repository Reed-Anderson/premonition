import type { Sport } from "./sport"

export type Competition = {
    id: string
    name: string
    sport: Sport
    startDate: string
    endDate: string
}

/* `today` defaults to now but can be overridden (e.g. in tests) since it isn't part of the Competition itself. */
export function isCompetitionActive(
    competition: Pick<Competition, "endDate">,
    today: string = new Date().toISOString().slice(0, 10),
): boolean {
    return competition.endDate >= today
}
