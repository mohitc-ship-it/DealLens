"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileUploadProps {
  onUploadSuccess: (reportId: string) => void
  isUploading: boolean
  setIsUploading: (uploading: boolean) => void
}

export function FileUpload({ onUploadSuccess, isUploading, setIsUploading }: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Please select a PDF file"
    }
    if (file.size > 10 * 1024 * 1024) {
      return "File size must be less than 10MB"
    }
    return null
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simulate upload progress with more realistic timing
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 300)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()

      setTimeout(() => {
        onUploadSuccess(data.reportId)
      }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setSelectedFile(file)
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    disabled: isUploading,
  })

  const handleUpload = () => {
    if (selectedFile) {
      uploadFile(selectedFile)
    }
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
          ${
            isDragActive
              ? "border-primary bg-primary/5 scale-105"
              : "border-border hover:border-primary/50 hover:bg-primary/2"
          }
          ${isUploading ? "cursor-not-allowed opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-6">
          {isUploading ? (
            <div className="relative">
              <div className="upload-animation">
                <Upload className="h-16 w-16 text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full animate-glow"></div>
            </div>
          ) : (
            <div className="relative group">
              <Upload className="h-16 w-16 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              <div className="absolute inset-0 rounded-full bg-primary/20 scale-0 group-hover:scale-110 transition-transform duration-300"></div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xl font-semibold text-foreground">
              {isDragActive ? "Drop your PDF here" : "Drag & drop your PDF here"}
            </p>
            <p className="text-muted-foreground">or click to select a file</p>
          </div>
        </div>

        {isDragActive && <div className="absolute inset-0 rounded-2xl animate-shimmer pointer-events-none"></div>}
      </div>

      {selectedFile && !isUploading && (
        <div className="flex items-center justify-between p-6 glass-effect rounded-2xl animate-scale-in">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <Button
            onClick={handleUpload}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Upload & Analyze
          </Button>
        </div>
      )}

      {isUploading && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Uploading and processing...</span>
            <span className="font-bold text-primary">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="relative">
            <Progress value={uploadProgress} className="h-3 rounded-full" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 animate-shimmer"></div>
          </div>
          {uploadProgress === 100 && (
            <div className="flex items-center justify-center gap-2 text-green-500 animate-scale-in">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Processing complete!</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="rounded-xl border-0 glass-effect animate-scale-in">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
