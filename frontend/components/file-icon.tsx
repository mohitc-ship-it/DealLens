import { FileText, FileSpreadsheet, FileImage, File } from "lucide-react"

export function FileIcon({ file }: { file: File }) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (["pdf"].includes(ext!)) return <FileText className="w-5 h-5 text-red-500" />
  if (["csv", "xlsx", "xls"].includes(ext!)) return <FileSpreadsheet className="w-5 h-5 text-green-500" />
  if (["docx"].includes(ext!)) return <FileText className="w-5 h-5 text-blue-500" />
  if (["pptx"].includes(ext!)) return <FileText className="w-5 h-5 text-orange-500" />
  if (["jpg", "jpeg", "png"].includes(ext!)) return <FileImage className="w-5 h-5 text-purple-500" />
  return <File className="w-5 h-5 text-gray-400" />
}
