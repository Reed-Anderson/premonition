import type { Competition } from "@premonition/types"
import { UnauthorizedError } from "./auth"

/*******************************************************************************
 *
 * Competitions API
 *
 ******************************************************************************/

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export async function fetchCompetitions(): Promise<Competition[]> {
    const res = await fetch(`${API_URL}/competitions`)
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}

export async function fetchCompetition(id: string): Promise<Competition> {
    const res = await fetch(`${API_URL}/competitions/${id}`)
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}

/* Resolves to an empty list rather than throwing when signed out, since that just means "no joined competitions". */
export async function fetchMyCompetitionIds(): Promise<string[]> {
    const res = await fetch(`${API_URL}/competitions/mine`, {
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

export async function joinCompetition(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/competitions/${id}/join`, {
        method: "POST",
        credentials: "include",
    })
    if (res.status === 401) {
        throw new UnauthorizedError()
    }
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
}
