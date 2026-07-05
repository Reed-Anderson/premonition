import { describe, expect, it } from "vitest"
import { formatDate } from "./dates"

/*******************************************************************************
 *
 * Date Formatting Tests
 *
 ******************************************************************************/

describe("formatDate", () => {
    it("formats an ISO date as a short US date", () => {
        expect(formatDate("2026-07-03")).toBe("Jul 3, 2026")
    })

    it("formats an ISO datetime the same as its date", () => {
        expect(formatDate("2026-01-09T20:00:00Z")).toBe("Jan 9, 2026")
    })
})
