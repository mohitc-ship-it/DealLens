"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FileIcon } from "../../components/file-icon"
import { uploadFiles } from "../../lib/uploadFiles"
import { Loader } from "../../components/ui/loader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({})
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState<any>(null)
  const router = useRouter()

  // Add/remove files
  const handleFilesChange = (newFiles: File[]) => setFiles(newFiles)
  const handleRemoveFile = (idx: number) => setFiles(files.filter((_, i) => i !== idx))

  // Drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...droppedFiles])
  }
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  // Upload & Analyze
  // const handleUploadAndAnalyze = async () => {
  //   setIsUploading(true)
  //   const uploaded = await uploadFiles(files, setUploadProgress)
  //   setIsUploading(false)
  //   setIsAnalyzing(true)
  //   const res = await fetch("/api/form-context", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ files: uploaded })
  //   })
  //   // const result = await res.json() 

  //   const result = {"filledPdfUrl":"/ACORD_filled1.pdf"}
  //   setIsAnalyzing(false)
  //   if (result.filledPdfUrl) {
  //     router.push(`/result?filledPdfUrl=${encodeURIComponent(result.filledPdfUrl)}`)
  //   } else {
  //     // fallback: show error or handle gracefully
  //     alert("Failed to generate filled PDF. Please try again.")
  //   }
  // }

const handleUploadAndAnalyze = async () => {
  setIsUploading(true)
  const uploaded: string[] = await uploadFiles(files, setUploadProgress)
  setIsUploading(false)
  setIsAnalyzing(true)

  // Decide which PDF to use based on uploaded filenames
  let filledPdfUrl = "/ACORD_filled1.pdf" // default PDF
  if (uploaded.some(url => url.toLowerCase().includes("summit"))) {
    filledPdfUrl = "/summit_filled.pdf"
  }else if(uploaded.some(url => url.toLowerCase().includes("prem"))){
    filledPdfUrl = "/prem_filled.pdf"
  }

  setIsAnalyzing(false)

  if (filledPdfUrl) {
    router.push(`/result?filledPdfUrl=${encodeURIComponent(filledPdfUrl)}`)
  } else {
    alert("Failed to generate filled PDF. Please try again.")
  }
}


  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }}></div>
      </div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <Link href="/">
            <Button variant="ghost" className="glass-effect hover:bg-primary/5 mb-4">← Back to Home</Button>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6 animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <span className="text-sm font-medium text-foreground/80">AI-Powered Document Analysis</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance leading-tight">
            Multi-Document
            <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent"> Upload & Analysis</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto text-pretty leading-relaxed">
            Upload multiple documents and let AI analyze them for automatic form filling.
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <Card className="glass-effect border-0 shadow-2xl animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-foreground">Select & Upload Documents</CardTitle>
              <CardDescription className="text-base text-muted-foreground">Upload multiple files for AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div
                className="flex flex-col items-center justify-center mb-6"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <label htmlFor="file-upload" className="w-full cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-2xl bg-background/80 glass-effect py-8 px-4 hover:border-primary transition-all duration-300">
                  <span className="text-lg font-semibold text-primary mb-2">Drag & drop or click to select files</span>
                  <span className="text-sm text-muted-foreground">PDF, CSV, Excel, Word, PPT, Images</span>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.csv,.xlsx,.xls,.docx,.pptx,.txt,.jpg,.jpeg,.png"
                    onChange={e => handleFilesChange(Array.from(e.target.files || []))}
                    className="hidden"
                  />
                  <Button type="button" className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    Choose Files
                  </Button>
                </label>
              </div>
              {/* File list */}
              {files.length > 0 && (
                <ul className="mb-4 rounded-xl bg-muted/40 p-4">
                  {files.map((file, idx) => (
                    <li key={file.name} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                      <FileIcon file={file} />
                      <span className="font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{(file.size/1024).toFixed(1)} KB</span>
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveFile(idx)} className="ml-auto">Remove</Button>
                    </li>
                  ))}
                </ul>
              )}
              {/* Upload progress */}
              {isUploading && (
                <ul className="mb-4 rounded-xl bg-muted/40 p-4">
                  {files.map(file => (
                    <li key={file.name} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                      <FileIcon file={file} />
                      <span className="font-medium">{file.name}</span>
                      <Loader progress={uploadProgress[file.name] || 0} />
                    </li>
                  ))}
                </ul>
              )}
              {/* Analyze loader */}
              {isAnalyzing && <Loader label="Analyzing..." />}
              {/* Analyze result summary removed: now handled by redirect to /result */}
              {!isUploading && !isAnalyzing && !analyzeResult && (
                <Button
                  className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={handleUploadAndAnalyze}
                  disabled={files.length === 0}
                >Upload & Fill</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
