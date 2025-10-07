export function Loader({ label, progress }: { label?: string; progress?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-32 h-2 bg-border rounded overflow-hidden">
        <div
          className="h-2 bg-primary rounded"
          style={{ width: `${progress ?? 100}%`, transition: "width 0.3s" }}
        ></div>
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      {typeof progress === "number" && <span className="text-xs text-muted-foreground">{progress}%</span>}
    </div>
  )
}
