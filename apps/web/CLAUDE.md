@AGENTS.md

# Colors

We have defined a primary color, and a secondary color. They should be sprinkled around the app. Primary used more than secondary.

# File Format

A .tsx file should be formatted as:

"use client" (if necessary)
imports
an outercomment that labels the main component
the main (probably exported) component
all the other stuff

# Components

- Every component gets its own file.
- If you're mapping an array into JSX, and that JSX requires more than three lines, extract it into its own component (in its own file).

# Icons

Use the `react-icons` package for iconography rather than hand-drawn SVGs. Any set in the package is fair game, but default to the `gi` (Game Icons) set first for anything sports/competition-related so icons stay visually consistent with each other — only reach for another set if `gi` doesn't have a reasonable match. Icons take a `className` for sizing/color the same way our old hand-rolled icon components did (e.g. `h-10 w-10 text-primary-600 dark:text-primary-400`), since they render with `fill="currentColor"` by default.

# Non-Component Code

Config and data access don't belong in page/component files. Things like the API base URL and the calls to `apps/api` live in `src/lib/` (e.g. `src/lib/competitions.ts`), imported via the `@/lib/*` alias. Types shared with `apps/api` come from `@premonition/types` (see the root CLAUDE.md's Shared Types section) rather than being redeclared locally.

# Testing

We use Vitest + React Testing Library (see `vitest.config.mts`). New `src/lib` functions and interactive components (state, handlers, conditional rendering) get a colocated `*.test.ts(x)` file. Purely presentational components with no branching/state logic don't need one.
