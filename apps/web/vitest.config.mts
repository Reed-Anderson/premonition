import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

export default defineConfig({
    plugins: [react()],
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./vitest.setup.ts"],
        env: {
            /* Pin timezone so date-formatting tests don't depend on the host machine's locale. */
            TZ: "UTC",
        },
    },
})
