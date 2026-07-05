# Premonition

This application is a sports prediction game. This is done with game credits, not real money. Players will sign up for a competition, such as the World Cup or the NFL season. During the course of the competition, credits will be given to players over time. Players will bet their credits on the outcome of games. The bets will create a global pool, and the pool will be shared by all who predicted correctly, relative to the size of bet placed.

## Repository Structure

This is an npm workspaces monorepo with two kinds of packages:

- `apps/*` — deployable applications. Currently `web` (Next.js frontend) and `api` (Express backend).
- `packages/*` — code shared across apps. Nothing here runs on its own; apps depend on it.

### Shared Types

Domain types that describe data crossing the boundary between `api` and `web` (or that more than one app needs to agree on) live in `packages/types`, one file per type, re-exported from `packages/types/src/index.ts`. Don't redefine a shared shape locally in an app — import it from `@premonition/types`.

A type's own file may also hold small functions, but only ones that are intrinsic to the type itself: a function belongs there only if it would still make sense pasted into an unrelated project, given only that type as input (a validator/parser, a derived-status calculation computed purely from the type's own fields). If a function needs another type, I/O, config, or app-specific rules, it's business logic, not a type function — it belongs in the owning app (e.g. bet-resolution or payout math belongs in `apps/api`, not `packages/types`).

`packages/types` currently ships as compiled JS + `.d.ts` (via `tsc`, see its `build`/`dev` scripts) rather than raw TS source, so both `apps/web` (Next.js/Turbopack) and `apps/api` (plain `tsc`) can consume it without extra bundler config. Run `npm run build --workspace=@premonition/types` (or its `dev` watch script) after changing it — consumers won't see edits until it's rebuilt.

## Comment Conventions

This project uses the **Outer Comments** VS Code extension for block comments in C-family languages. Don't hand-design a comment box — use the extension's exact snippet bodies below (from `reed-anderson.outer-comments-1.0.0/snippets/comments.code-snippets`), since a guessed format (e.g. dash borders with a centered label) will not match what the extension actually renders.

- `outercomment` — an 80-character-wide, 5-line-tall block comment for top-level section headers, at zero indentation. The first text line becomes its label:

  ```
  /*******************************************************************************
   *
   * ${1:comment}
   *
   ******************************************************************************/
  ```

- `innercomment` — a 76-character-wide, 3-line-tall block comment for subsections within an outer comment, indented one level (the snippet body itself has no leading indent — it inherits whatever indentation is already at the cursor, so shift every line right by the surrounding code's indent when writing this by hand):

  ```
  /***************************************************************************
   * ${1:comment}
   **************************************************************************/
  ```

Extra lines (for example a `Purpose:` line) can be added before the closing border — only the first text line is used as the label.

Use the Explorer's "Outer Comments" view to navigate between these comments by line number; inner comments nest under whichever outer comment precedes them.

Follow this convention for block comments instead of ad-hoc styles.

In other comments, /**/ styles are preferred over //.

Every file should open with an `outercomment` block immediately below its imports, labeling the section that follows (e.g. `Auth Routes`, `Config`). If a file has no imports, the block goes at the top instead.

Apps may extend these conventions for their own file types — see `apps/api/CLAUDE.md` for Express-specific comment conventions.