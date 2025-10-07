import { type NextRequest, NextResponse } from "next/server"


const API_BASE_URL =  "http://localhost:8000/form-context-upload/"

export async function POST(request: NextRequest) {
  try {
    // Accept JSON with files info (from uploadFiles)
    const body = await request.json()
    const files = body.files
    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    // Forward all files to backend API
    const backendFormData = new FormData()
    files.forEach((fileObj: any, idx: number) => {
      // fileObj should have { name, url, ... }
      // If you have the actual File, use that. Otherwise, fetch the file from url and append as Blob.
      backendFormData.append("file", fileObj.url || fileObj.name)
    })

    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      body: backendFormData,
      signal: AbortSignal.timeout(300000), // 5 min timeout
    })

    if (response.ok) {
      // Expect backend to return filled PDF (or its URL)
      const backendData = await response.json()
      // Example: { filledPdfUrl: "..." }
      return NextResponse.json({ filledPdfUrl: backendData.filledPdfUrl })
    } else {
      return NextResponse.json({ error: "Backend error" }, { status: 500 })
    }
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
        details: "Please check your files and try again",
      },
      { status: 500 },
    )
  }
}

