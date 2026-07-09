export type Sport = "SOCCER" | "FOOTBALL" | "HOCKEY"

/* Whether a game in this sport can end in a tie, and so be bet on as one. */
export function sportAllowsTie(sport: Sport): boolean {
    return sport === "SOCCER"
}
