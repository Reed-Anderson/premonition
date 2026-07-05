import type { User } from "@premonition/types"

/*******************************************************************************
 *
 * Auth API
 *
 ******************************************************************************/

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

/* Thrown by API calls that require a signed-in user so callers can redirect to sign-in instead of showing a generic error. */
export class UnauthorizedError extends Error {
    constructor() {
        super("Not signed in")
        this.name = "UnauthorizedError"
    }
}

export function googleSignInUrl(): string {
    return `${API_URL}/auth/google`
}

export async function fetchCurrentUser(): Promise<User | null> {
    const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" })
    if (res.status === 401) {
        return null
    }
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
    return res.json()
}

export async function signOut(): Promise<void> {
    const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
    })
    if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`)
    }
}
