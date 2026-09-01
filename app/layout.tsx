import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"

import { NativeBootstrap } from "@/components/native-bootstrap"
import { ThemeBootstrap } from "@/components/theme-bootstrap"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const themeBootScript = `(function(){try{var t=localStorage.getItem("tabata-theme");if(t!=="light"&&t!=="dark"&&t!=="custom")t="dark";var r=document.documentElement;r.setAttribute("data-theme",t);r.classList.toggle("dark",t!=="light");}catch(e){document.documentElement.setAttribute("data-theme","dark");document.documentElement.classList.add("dark");}})();`

export const metadata: Metadata = {
  title: "Tabata",
  description: "Minimal tabata-timer. 19 kr i måneden.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tabata",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nb"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-canvas font-sans text-ink">
        <Script id="tabata-theme" strategy="beforeInteractive">
          {themeBootScript}
        </Script>
        <NativeBootstrap />
        <ThemeBootstrap />
        {children}
      </body>
    </html>
  )
}
