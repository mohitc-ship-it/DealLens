"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ResultPage({ searchParams }: { searchParams: { filledPdfUrl?: string } }) {
  const router = useRouter()
  const filledPdfUrl = searchParams?.filledPdfUrl

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
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-balance leading-tight">
            Filled PDF Result
          </h1>
        </div>
        <div className="max-w-2xl mx-auto">
          <Card className="glass-effect border-0 shadow-2xl animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-foreground">Your Filled PDF</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {filledPdfUrl ? (
                <div className="flex flex-col items-center">
                  <iframe
                    src={filledPdfUrl}
                    title="Filled PDF"
                    className="w-full h-[600px] rounded-xl border"
                  />
                  <a href={filledPdfUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="mt-6">Download PDF</Button>
                  </a>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">No PDF result available.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


// "use client"

// import { useEffect, useRef, useState } from "react"
// import { Button } from "@/components/ui/button"
// import { PDFDocument, PDFTextField } from "pdf-lib"
// import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist"

// interface EditablePdfProps {
//   pdfUrl: string
// }

// interface PdfField {
//   name: string
//   type: string
//   value: string
// }

// export default function EditablePdf({ pdfUrl }: EditablePdfProps) {
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null)
//   const [fields, setFields] = useState<PdfField[]>([])

//   useEffect(() => {
//     // Setup PDF.js worker
//     GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version || "3.11.328"}/pdf.worker.min.js`

//     const loadPdf = async () => {
//       // Fetch PDF
//       const arrayBuffer = await fetch(pdfUrl).then(res => res.arrayBuffer())

//       // Load PDF with pdf-lib
//       const pdfDocument = await PDFDocument.load(arrayBuffer)
//       setPdfDoc(pdfDocument)

//       // Extract AcroForm fields
//       const form = pdfDocument.getForm()
//       const fieldObjs: PdfField[] = form.getFields().map(f => {
//         let value = ""
//         if (f instanceof PDFTextField) value = f.getText() || ""
//         return {
//           name: f.getName(),
//           type: f.constructor.name,
//           value
//         }
//       })
//       setFields(fieldObjs)

//       // Render first page on canvas
//       const pdf = await getDocument({ data: arrayBuffer }).promise
//       const page = await pdf.getPage(1)
//       const viewport = page.getViewport({ scale: 1.5 })
//       const canvas = canvasRef.current!
//       canvas.width = viewport.width
//       canvas.height = viewport.height
//       await page.render({ canvas, viewport }).promise
//     }

//     loadPdf()
//   }, [pdfUrl])

//   // Update field value in pdf-lib and state
//   const updateField = (name: string, value: string) => {
//     if (!pdfDoc) return
//     const form = pdfDoc.getForm()
//     const field = form.getTextField(name)
//     field?.setText(value)
//     setFields(prev => prev.map(f => (f.name === name ? { ...f, value } : f)))
//   }

//   // Download edited PDF
// const downloadPdf = async () => {
//   if (!pdfDoc) return

//   // Save PDF bytes
//   const pdfBytes = await pdfDoc.save()

//   // Force the buffer to a real ArrayBuffer
//   const arrayBuffer = pdfBytes.buffer as ArrayBuffer

//   // Create Blob
//   const blob = new Blob([arrayBuffer], { type: "application/pdf" })

//   // Trigger download
//   const link = document.createElement("a")
//   link.href = URL.createObjectURL(blob)
//   link.download = "edited.pdf"
//   link.click()
// }


//   return (
//     <div className="flex flex-col items-center gap-6">
//       <canvas ref={canvasRef} className="border rounded-xl" />

//       <div className="flex flex-col gap-4 w-full max-w-md">
//         {fields.map(f => (
//           <div key={f.name}>
//             <label className="block text-sm font-medium text-foreground mb-1">{f.name}</label>
//             <input
//               type="text"
//               value={f.value}
//               onChange={e => updateField(f.name, e.target.value)}
//               className="w-full border rounded px-3 py-2"
//             />
//           </div>
//         ))}
//       </div>

//       <Button onClick={downloadPdf}>Download Edited PDF</Button>
//     </div>
//   )
// }
