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
//   useEffect(() => {
//   const controller = new AbortController();
//   const signal = controller.signal;

//   fetch(`/api/report/${reportId}`, { signal })
//     .then((res) => res.json())
//     .then((data) => {
//       // Handle data
//     })
//     .catch((err) => {
//       if (err.name === 'AbortError') {
//         // Log or handle the cancellation
//       } else {
//         // Handle other errors
//       }
//     });

//   // Cleanup function to abort the first request
//   return () => {
//     controller.abort();
//   };
// }, [reportId]);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 30; // ~1 minute
    const retryDelay = 2000; // 2 seconds

    const pollReport = async () => {
      try {
        const response = await fetch(`/api/report/${reportId}`);
        if (!response.ok) throw new Error("Failed to fetch report");
        let data = await response.json();
        data = data.report;
        if (data && isMounted) {
          setReport(data);
          setError(null);
          setLoading(false);
        } else if (isMounted) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(pollReport, retryDelay);
          } else {
            setError("Report is still processing. Please refresh or try again later.");
            setReport(null);
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(pollReport, retryDelay);
          } else {
            setError("Report is still processing. Please refresh or try again later.");
            setReport(null);
            setLoading(false);
          }
        }
      }
    };
    setLoading(true);
    setError(null);
    setReport(null);
    if (reportId) pollReport();
    return () => {
      isMounted = false;
    };
  }, [reportId]);
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-primary mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <h2 className="text-2xl font-bold mb-2">Preparing your report...</h2>
        <p className="text-muted-foreground text-lg">This may take a moment. Please wait while we generate your report.</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4 text-destructive text-lg font-semibold">{error}</p>
        <Button onClick={() => (window.location.href = "/upload")}>Upload New Document</Button>
      </div>
    );
  }
  if (!report) {
    return null;
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
                fixed top-0 right-0 h-full w-full max-w-lg bg-card border-l border-border z-50
                lg:relative lg:max-w-none lg:w-[425px] lg:z-auto
              "
            >
              {/* <div className="flex justify-end p-3 border-b border-border"> */}
                {/* <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsChatOpen(false)}
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </Button> */}
              {/* </div> */}
              <ChatPanel 
                reportId={reportId} 
                report={report} 
                onClose={() => setIsChatOpen(false)}
                setReport={setReport}
              />
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
