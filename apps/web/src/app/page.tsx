import Link from "next/link"

export default function Home() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex flex-col items-center gap-4 text-center">
                <h1 className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
                    Premonition
                </h1>
                <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
                    Predict outcomes. Wager credits. Win the pool.
                </p>
                <Link
                    href="/competitions"
                    className="mt-2 rounded-md bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 dark:bg-primary-500 dark:text-black dark:hover:bg-primary-400"
                >
                    Browse Competitions
                </Link>
            </main>
        </div>
    )
}
