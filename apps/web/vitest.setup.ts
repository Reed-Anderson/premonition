import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"
import "@testing-library/jest-dom/vitest"

/* jsdom doesn't implement scrollIntoView; stub it so components that call it don't crash tests. */
Element.prototype.scrollIntoView = () => {}

afterEach(() => {
    cleanup()
})
