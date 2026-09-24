import type { Metadata } from "next"
import { Geist_Mono, Inter, Orbitron, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import CustomCursor from "@/components/CustomCursor"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
})

export const metadata: Metadata = {
  title: "MoraXtreme 11.0 | Sri Lanka's Largest Algorithmic Coding Competition",
  description: "MoraXtreme is Sri Lanka's premier annual algorithmic coding competition, organized by the IEEE Student Branch of the University of Moratuwa. The ultimate proving ground for IEEEXtreme.",
  keywords: ["MoraXtreme", "IEEEXtreme", "Coding Competition", "University of Moratuwa", "IEEE", "Competitive Programming", "Sri Lanka", "Hackathon", "Algorithms"],
  authors: [{ name: "IEEE Student Branch, University of Moratuwa" }],
  openGraph: {
    title: "MoraXtreme 11.0 | Sri Lanka's Largest Algorithmic Coding Competition",
    description: "Join MoraXtreme, Sri Lanka's premier algorithmic coding competition. Test your programming skills, compete with the best, and win exciting prizes.",
    url: "https://moraxtreme.lk/",
    siteName: "MoraXtreme 11.0",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "MoraXtreme 11.0 Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoraXtreme 11.0",
    description: "Sri Lanka's premier annual algorithmic coding competition.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased scroll-smooth", fontMono.variable, orbitron.variable, spaceGrotesk.variable, "font-sans", inter.variable)}
    >
      <body>
        <CustomCursor />
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
