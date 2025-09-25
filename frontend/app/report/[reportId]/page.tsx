"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ReportViewer } from "@/components/report-viewer"
import { ChatPanel } from "@/components/chat-panel"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from "lucide-react"
interface ReportData {
  id: string
  title: string
  content: string
  createdAt: string
  metadata?: {
    pages: number
    fileSize: string
    processingTime: string
  }
}
export default function ReportPage() {
  const params = useParams()
  const reportId = params.reportId as string
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/report/${reportId}`)
        if (!response.ok) throw new Error("Failed to fetch report")
        const data = await response.json()
        setReport(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report")
      } finally {
        setLoading(false)
      }
    }
    if (reportId) fetchReport()
  }, [reportId])
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading report...</p>
      </div>
    )
  }
  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="mb-4 text-destructive">{error || "Report not found"}</p>
        <Button onClick={() => (window.location.href = "/upload")}>Upload New Document</Button>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Main content area that resizes */}
        <div className="flex-1 transition-all duration-300 ease-in-out overflow-y-auto">
          <ReportViewer report={report} />
        </div>
        {/* --- MODIFIED SECTION --- */}
        {/* Conditionally render the entire chat panel and its overlay */}
        {isChatOpen && (
          <>
            {/* Overlay for mobile/tablet screens */}
            <div
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            />
            {/* The Chat Panel itself */}
            <div
              className="
                fixed top-0 right-0 h-full w-full max-w-sm bg-card border-l border-border z-50
                lg:relative lg:max-w-none lg:w-96 lg:z-auto
              "
            >
              <div className="flex justify-end p-3 border-b border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsChatOpen(false)}
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ChatPanel reportId={reportId} onClose={() => setIsChatOpen(false)} />
            </div>
          </>
        )}
        {/* Floating toggle button - only visible when chat is closed */}
        {!isChatOpen && (
          <Button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-30"
            size="icon"
            aria-label="Open chat"
          >
            <MessageSquare />
          </Button>
        )}
      </div>
    </div>
  )
}
