const { chromium } = require("playwright")

;(async () => {
    const browser = await chromium.launch()
    const page = await browser.newPage()
    page.on("response", (res) => {
        if (res.status() === 404) console.log("404:", res.url())
    })
    await page.goto("http://localhost:3000/leaderboard", { waitUntil: "networkidle" })
    await browser.close()
})()
