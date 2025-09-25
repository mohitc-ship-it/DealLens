// Utility functions for API calls with error handling

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(errorData.error || "Request failed", response.status, errorData.details)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Network or other errors
    throw new ApiError("Network error occurred", 0, error instanceof Error ? error.message : "Unknown error")
  }
}

export async function uploadFile(file: File): Promise<{ reportId: string }> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(errorData.error || "Upload failed", response.status, errorData.details)
  }

  return await response.json()
}

export async function fetchReport(reportId: string) {
  return apiRequest(`/api/report/${reportId}`)
}

export async function sendChatMessage(reportId: string, message: string) {
  return apiRequest(`/api/chat/${reportId}`, {
    method: "POST",
    body: JSON.stringify({ message }),
  })
}
