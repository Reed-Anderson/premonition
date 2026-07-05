# API

Express backend for Premonition. This file extends the root `CLAUDE.md` — read that first for the overall Comment Conventions (the `outercomment`/`innercomment` snippets, block-comment style, etc.). Everything below is specific to this app.

## Route Handler Docs

Every Express route handler (`.get`/`.post`/etc.) gets a JSDoc block above it. Skip `@param {Request} req` / `@param {Response} res` — they're identical on every handler and say nothing. Instead document the actual contract:

- A one-line description (plus any extra prose, e.g. why a route is registered in a particular order).
- `@route METHOD /path`
- `@param {Type} name - description (path|query|body)` for each real path/query/body param, by name.
- `@returns {Type} status - description` for each distinct response shape, one line per status code.

```
/**
 * Place a bet on a game.
 *
 * @route POST /games/:id/bets
 * @param {string} id - game id (path)
 * @param {"home"|"away"} outcome - predicted winner (body)
 * @param {number} wager - credits to bet (body)
 * @returns {Bet} 201 - created bet
 * @returns {ApiError} 400 - invalid outcome or wager
 * @returns {ApiError} 401 - not signed in
 * @returns {ApiError} 403 - not a member of this competition
 * @returns {ApiError} 404 - game not found
 * @returns {ApiError} 409 - bet already placed
 */
```

## Route Files

Files under `src/routes/` override the root rule that a file opens with a single `outercomment` labeling the whole file. Instead, group handlers by HTTP method — each method gets its own `outercomment` header (`GET Routes`, `POST Routes`, ...), in the order the methods first appear, with all handlers for a method kept contiguous underneath it. Since two `outercomment` blocks can't sit back to back, the router declaration (`export const xRouter = express.Router()`) goes between the imports and the first method header; that first header is what satisfies the root convention's "section immediately below imports" rule.

## Route Handler Steps

If a handler's body has at least three distinct steps (blank-line-separated blocks of logic — an auth check, a lookup, a mutation, etc.), precede each step with an `innercomment` naming it. Handlers with one or two steps don't need this — the JSDoc block above already covers them. For example, `POST /games/:id/bets` in `src/routes/competitions.ts` has five steps: require sign-in, validate the payload, look up the game, confirm competition membership, then place the bet.
