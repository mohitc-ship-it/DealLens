import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL =  "http://localhost:8000/upload/"

const reportStorage = new Map<string, any>()
function generateReportId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `report_${timestamp}_${randomStr}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type and size
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    try {
      // Forward to backend API
      const backendFormData = new FormData()
      backendFormData.append("file", file)

      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        body: backendFormData,
        // Add timeout to prevent hanging
        // signal: AbortSignal.timeout(30000), // Increased timeout for PDF processing
      })


      console.log("response is .,", response)

      if (response.ok) {
        const backendData = await response.json()

        if (backendData.reportId && backendData.reportData) {
          reportStorage.set(backendData.reportId, backendData.reportData)

          return NextResponse.json({
            reportId: backendData.reportId,
            message: "File processed successfully",
            filename: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          })
        } else {
          return NextResponse.json({
            reportId: backendData.reportId || generateReportId(),
            message: "File uploaded successfully, processing in progress",
            filename: file.name,
            size: file.size,
            uploadedAt: new Date().toISOString(),
          })
        }
      }
    } catch (backendError) {
      console.log("Backend not available, generating reportId locally:", backendError)
    }

    const reportId = generateReportId()

    // Store minimal metadata for fallback
    reportStorage.set(reportId, {
      id: reportId,
      title: "Document Analysis Report",
      filename: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: "backend_unavailable",
      message: "Backend processing service is currently unavailable. Please try again later.",
    })

    return NextResponse.json({
      reportId,
      message: "File uploaded successfully",
      filename: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
        details: "Please check your file and try again",
      },
      { status: 500 },
    )
  }
}

export { reportStorage }
