import type { Competition } from "@premonition/types"
import CompetitionListItem, {
    type CompetitionStatus,
} from "./competition-list-item"

/*******************************************************************************
 *
 * Competition Section
 *
 ******************************************************************************/

export default function CompetitionSection({
    title,
    competitions,
    status,
}: {
    title: string
    competitions: Competition[]
    status: CompetitionStatus
}) {
    if (competitions.length === 0) {
        return null
    }

    return (
        <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
                {title}
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {competitions.map((competition, index) => (
                    <CompetitionListItem
                        key={competition.id}
                        competition={competition}
                        status={status}
                        isPopular={status === "open" && index === 0}
                    />
                ))}
            </ul>
        </section>
    )
}
