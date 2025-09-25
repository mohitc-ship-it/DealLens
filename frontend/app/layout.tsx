import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Suspense fallback={<div>Loading...</div>}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Suspense>
      </body>
    </html>
  )
}
