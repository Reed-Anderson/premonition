/*******************************************************************************
 *
 * Google OAuth Client
 *
 ******************************************************************************/

/* arctic ships as ESM-only; apps/api is CommonJS, so it's loaded via dynamic import and kept out of this app's static import graph. */

export type GoogleIdTokenClaims = {
    sub: string
    email: string
    name: string
    picture?: string
}

async function createGoogleClient() {
    const { Google } = await import("arctic")

    if (
        !process.env.GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET ||
        !process.env.GOOGLE_REDIRECT_URI
    ) {
        throw new Error("Google OAuth environment variables are not set")
    }

    return new Google(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
    )
}

let googleClientPromise: ReturnType<typeof createGoogleClient> | null = null

async function getGoogleClient() {
    if (!googleClientPromise) {
        googleClientPromise = createGoogleClient()
    }
    return googleClientPromise
}

export async function createGoogleAuthorizationURL(): Promise<{
    url: string
    state: string
    codeVerifier: string
}> {
    const { generateCodeVerifier, generateState } = await import("arctic")
    const client = await getGoogleClient()

    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const url = client.createAuthorizationURL(state, codeVerifier, [
        "openid",
        "email",
        "profile",
    ])
    /* Without this, Google silently re-authenticates whichever Google account is already signed into the browser instead of letting the user choose. */
    url.searchParams.set("prompt", "select_account")

    return { url: url.toString(), state, codeVerifier }
}

export async function exchangeGoogleCode(
    code: string,
    codeVerifier: string,
): Promise<GoogleIdTokenClaims> {
    const { decodeIdToken } = await import("arctic")
    const client = await getGoogleClient()

    const tokens = await client.validateAuthorizationCode(code, codeVerifier)
    return decodeIdToken(tokens.idToken()) as GoogleIdTokenClaims
}
