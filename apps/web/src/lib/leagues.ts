import type { League, User } from "@premonition/types"
import { UnauthorizedError } from "./auth"

/*******************************************************************************
 *
 * Leagues API
 *
 ******************************************************************************/

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

/* Thrown when joining a league whose invite code doesn't match any league. */
export class LeagueNotFoundError extends Error {
    constructor() {
        super("No league with this invite code")
        this.name = "LeagueNotFoundError"
    }
}

/* Resolves to an empty list rather than throwing when signed out, since that just means "no leagues yet". */
export async function fetchMyLeagues(competitionId: string): Promise<League[]> {
    const res = await fetch(
        `${API_URL}/competitions/${competitionId}/leagues/mine`,
        { credentials: "include" },
    )
    if (res.status === 401) {
        return []
    }
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}

export async function fetchLeagueMembers(id: string): Promise<User[]> {
    const res = await fetch(`${API_URL}/leagues/${id}/members`, {
        credentials: "include",
    })
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}

export async function createLeague(
    competitionId: string,
    name: string,
): Promise<League> {
    const res = await fetch(
        `${API_URL}/competitions/${competitionId}/leagues`,
        {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        },
    )
    if (res.status === 401) {
        throw new UnauthorizedError()
    }
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}

export async function joinLeague(inviteCode: string): Promise<League> {
    const res = await fetch(`${API_URL}/leagues/join`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
    })
    if (res.status === 401) {
        throw new UnauthorizedError()
    }
    if (res.status === 404) {
        throw new LeagueNotFoundError()
    }
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}
