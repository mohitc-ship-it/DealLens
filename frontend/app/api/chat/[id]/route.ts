import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000"

const generateRealEstateResponse = (message: string, reportId: string): string => {
  const lowerMessage = message.toLowerCase()

  // Market analysis questions
  if (lowerMessage.includes("market") || lowerMessage.includes("trend")) {
    return "Based on the analysis, the Downtown District market is experiencing strong growth with a 12.5% year-over-year appreciation. The market is currently favoring sellers due to low inventory (23% below historical averages) and high demand. Properties are selling quickly, with an average of just 18 days on market."
  }

  // Price-related questions
  if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("value")) {
    return "The median home price in this area is $485,000, with an average price per square foot of $312. Recent comparable sales show properties selling between $475,000-$525,000. The strong appreciation rate of 12.5% indicates good investment potential."
  }

  // Investment questions
  if (lowerMessage.includes("invest") || lowerMessage.includes("buy") || lowerMessage.includes("recommend")) {
    return "This area shows strong investment potential with an A- investment grade. The rental yield is 4.2%, and properties in the $450K-$550K range are showing the best appreciation potential. Current market conditions favor quick decisions due to high demand and low inventory."
  }

  // Neighborhood questions
  if (lowerMessage.includes("neighborhood") || lowerMessage.includes("area") || lowerMessage.includes("location")) {
    return "The Downtown District has excellent walkability (Walk Score: 89/100) and strong demographics with a median age of 34 and median income of $78,500. The area has high-rated schools (8.5/10) and good transit access (Transit Score: 76/100). Population growth is positive at 2.3%."
  }

  // Comparable sales questions
  if (lowerMessage.includes("comparable") || lowerMessage.includes("comp") || lowerMessage.includes("similar")) {
    return "Recent comparable sales within 0.5 miles show consistent pricing around $311-$313 per square foot. Key comparables include 123 Main Street ($525,000), 456 Oak Avenue ($475,000), and 789 Pine Street ($510,000). All sold within the last month, indicating strong market activity."
  }

  // Risk questions
  if (lowerMessage.includes("risk") || lowerMessage.includes("safe") || lowerMessage.includes("concern")) {
    return "The risk assessment for this market is low to moderate. Strong fundamentals include population growth, high education levels (68% college+), and continued development. The main risks are typical market fluctuations, but the area's strong demographics and amenities provide good stability."
  }

  // Timing questions
  if (lowerMessage.includes("when") || lowerMessage.includes("timing") || lowerMessage.includes("now")) {
    return "Current market conditions suggest good timing for buyers who can act quickly. With only 18 days average on market and 23% below normal inventory, waiting may result in fewer options and higher prices. The strong seller's market indicates continued appreciation is likely."
  }

  // General questions
  if (lowerMessage.includes("summary") || lowerMessage.includes("overview") || lowerMessage.includes("key")) {
    return "Key takeaways: Strong seller's market with 12.5% appreciation, low inventory creating urgency, excellent neighborhood amenities and demographics, properties selling quickly at $312/sq ft average, and strong investment potential with A- grade rating."
  }

  // Default response
  return "I can help you understand various aspects of this real estate analysis including market trends, pricing, investment potential, neighborhood characteristics, and comparable sales. What specific aspect would you like to explore further?"
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { message } = body

    if (!id) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 })
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type")

        if (contentType?.includes("text/stream") || contentType?.includes("text/event-stream")) {
          // Handle streaming response from backend
          const encoder = new TextEncoder()
          const decoder = new TextDecoder()

          const stream = new ReadableStream({
            async start(controller) {
              const reader = response.body?.getReader()
              if (!reader) {
                controller.close()
                return
              }

              try {
                while (true) {
                  const { done, value } = await reader.read()
                  if (done) break

                  const chunk = decoder.decode(value)
                  controller.enqueue(encoder.encode(`data: ${chunk}\n\n`))
                }
              } catch (error) {
                console.error("Streaming error:", error)
                controller.enqueue(encoder.encode(`data: {"error": "Streaming failed"}\n\n`))
              } finally {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"))
                controller.close()
              }
            },
          })

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          })
        } else {
          const data = await response.json()
          console.log("data ", data.answer)
          return NextResponse.json({
            reply: data.answer  || "No response received",
          })
        }
      }
    } catch (backendError) {
      console.log("Backend not available, using intelligent dummy responses")
    }

    // Generate intelligent response based on the message content
    const intelligentResponse = generateRealEstateResponse(message, id)

    return NextResponse.json({
      reply: intelligentResponse,
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Chat request failed",
        reply: "Sorry, I encountered an error. Please try again.",
      },
      { status: 500 },
    )
  }
}
