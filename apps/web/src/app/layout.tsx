import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Navbar from "@/components/navbar"
import "./globals.css"

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
})

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "Premonition",
    description: "Predict outcomes. Wager credits. Win the pool.",
}

type RootLayoutProps = Readonly<{
    children: React.ReactNode
}>

export default function RootLayout(props: RootLayoutProps) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <Navbar />
                {props.children}
            </body>
        </html>
    )
}
