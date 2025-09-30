"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X } from "lucide-react"
import { handleQuery } from "@/utils/chatbotRequest"
import ReactMarkdown from "react-markdown"
import DOMPurify from "dompurify"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatPanelProps {
  reportId: string
  onClose: () => void
  report: object
  setReport: (report: any) => void
}

export function ChatPanel({ reportId, onClose, report, setReport }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your real estate analysis assistant. I can help you understand market trends, pricing analysis, investment potential, neighborhood insights, and comparable sales from your report. What would you like to explore?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])

  const suggestedQuestions = [
    "What's the current market trend?",
    "Is this a good investment?",
    "How do prices compare to similar properties?",
    "What are the neighborhood highlights?",
    "What are the key risks to consider?",
    "When is the best time to buy?",
  ]

  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSuggestionClick = (question: string) => {
    setInputValue(question)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    setShowSuggestions(false)

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      let queryRoute = await handleQuery(inputValue, report);
      let displayContent = "";

      if (queryRoute && typeof queryRoute === "object" && queryRoute.result === "call_rag") {
        // Show a loader node (not text) while waiting for RAG
        const loaderId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          {
            id: loaderId,
            content: "__LOADER__",
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
        // Call API if result indicates
        const apiResponse = await fetch(`/api/chat/${reportId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: inputValue, report }),
        });
        const data = await apiResponse.json();
        displayContent = typeof data.reply === "string" ? data.reply : JSON.stringify(data.reply, null, 2);
        // Replace the loader node with the real answer
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loaderId
              ? { ...msg, content: displayContent }
              : msg
          )
        );
      } else if (queryRoute && typeof queryRoute === "object" && !("result" in queryRoute)) {
        // JSON object without result → update report
        setReport(queryRoute);
        displayContent = "Report updated successfully.";
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: displayContent,
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
      } else {
        // Fallback → string or other
        displayContent = typeof queryRoute === "string" ? queryRoute : JSON.stringify(queryRoute, null, 2);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content: displayContent,
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };  // Close sendMessage function

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="h-full flex flex-col border-0 rounded-none overflow-auto w-full max-w-2xl mx-auto">
     <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-semibold text-lg">Real Estate Assistant</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chat">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4 chat-scrollbar">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback
                    className={message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}
                  >
                    {message.role === "user" ? "👤" : "🤖"}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex-1 space-y-1 ${message.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {/* Show loader spinner if content is __LOADER__ */}
                    {message.content === "__LOADER__" ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm text-muted-foreground">Analyzing your question...</span>
                      </div>
                    ) : message.role === "assistant" ? (
                      <ReactMarkdown
                        components={{
                          a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-800" />,
                          ul: (props) => <ul {...props} className="list-disc pl-5" />,
                          ol: (props) => <ol {...props} className="list-decimal pl-5" />,
                          li: (props) => <li {...props} className="mb-1" />,
                          strong: (props) => <strong {...props} className="font-semibold" />,
                          em: (props) => <em {...props} className="italic" />,
                          code: (props) => <code {...props} className="bg-muted px-1 rounded text-xs" />,
                        }}
                        skipHtml={false}
                        children={DOMPurify.sanitize(message.content)}
                      />
                    ) : (
                      message.content
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground px-1">{formatTime(message.timestamp)}</p>
                </div>
              </div>
            ))}

            {showSuggestions && messages.length === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground px-1">Try asking:</p>
                <div className="grid gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(question)}
                      className="text-left p-3 text-sm bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent hover:border-border"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Only show loader if isLoading and there is no assistant loader node present */}
            {isLoading && !messages.some(m => m.role === "assistant" && m.content === "__LOADER__") && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted">🤖</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="inline-block bg-muted p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Analyzing your question...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about market trends, pricing, investment potential..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!inputValue.trim() || isLoading} size="icon">
              <span className="text-sm">→</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 px-1">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </CardContent>
    </Card>
  )
}
