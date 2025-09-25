"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/file-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const handleUploadSuccess = (reportId: string) => {
    router.push(`/report/${reportId}`)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 animate-fade-in-up">
          <Link href="/">
            <Button variant="ghost" className="glass-effect hover:bg-primary/5 mb-4">
              ← Back to Home
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6">
              ✨<span className="text-sm font-medium text-foreground/80">AI Document Analysis</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-balance mb-6 leading-tight">
              Upload Your
              <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                {" "}
                PDF Document
              </span>
            </h1>

            <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
              Upload your PDF document to generate comprehensive insights and analysis with our advanced AI technology
            </p>
          </div>

          <Card
            className="glass-effect border-0 shadow-2xl hover-lift animate-scale-in"
            style={{ animationDelay: "0.4s" }}
          >
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-foreground">Upload Document</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Select a PDF file to analyze • Maximum file size: 10MB
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />

              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">Want to see how the report looks first?</p>
                  <Link href="/report/0">
                    <Button
                      variant="outline"
                      className="glass-effect hover:bg-primary/5 border-primary/20 text-primary hover:text-primary font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 bg-transparent"
                    >
                      View Demo Report
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-xl glass-effect">
              <span className="text-sm text-muted-foreground">Supported formats:</span>
              <span className="text-sm font-medium text-foreground">PDF</span>
              <div className="w-px h-4 bg-border"></div>
              <span className="text-sm text-muted-foreground">Maximum size:</span>
              <span className="text-sm font-medium text-foreground">10MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
