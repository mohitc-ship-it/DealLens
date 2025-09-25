import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-20 animate-fade-in-up">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6 animate-scale-in"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="text-sm font-medium text-foreground/80">AI-Powered Document Analysis</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
            PDF Report
            <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
              {" "}
              Analysis
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty leading-relaxed">
            Transform your PDF documents into intelligent insights with our cutting-edge AI analysis platform
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in"
            style={{ animationDelay: "0.4s" }}
          >
            <Link href="/upload">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Started
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold rounded-xl glass-effect hover:bg-primary/5 transition-all duration-300 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <Card className="glass-effect hover-lift border-0 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <CardHeader className="text-center p-8">
              <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-primary/20 flex items-center justify-center backdrop-blur-sm">
                <div className="w-8 h-8 bg-primary/20 rounded"></div>
              </div>
              <CardTitle className="text-foreground text-xl font-bold mb-3">Smart Upload</CardTitle>
              <CardDescription className="text-muted-foreground text-base leading-relaxed">
                Drag and drop your PDF files with intelligent validation and instant processing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-effect hover-lift border-0 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            <CardHeader className="text-center p-8">
              <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
                <div className="w-8 h-8 bg-green-500/20 rounded"></div>
              </div>
              <CardTitle className="text-foreground text-xl font-bold mb-3">Deep Analysis</CardTitle>
              <CardDescription className="text-muted-foreground text-base leading-relaxed">
                Get comprehensive insights and detailed analysis from your documents using advanced AI
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-effect hover-lift border-0 animate-fade-in-up" style={{ animationDelay: "1s" }}>
            <CardHeader className="text-center p-8">
              <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center backdrop-blur-sm">
                <div className="w-8 h-8 bg-purple-500/20 rounded"></div>
              </div>
              <CardTitle className="text-foreground text-xl font-bold mb-3">AI Chat</CardTitle>
              <CardDescription className="text-muted-foreground text-base leading-relaxed">
                Ask questions and get intelligent responses about your reports in real-time
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center animate-fade-in-up" style={{ animationDelay: "1.2s" }}>
          <div className="inline-flex items-center gap-6 px-8 py-4 rounded-2xl glass-effect">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500/20 rounded"></div>
              <span className="text-sm font-medium text-muted-foreground">Secure & Private</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-yellow-500/20 rounded"></div>
              <span className="text-sm font-medium text-muted-foreground">Lightning Fast</span>
            </div>
            <div className="w-px h-6 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-primary/20 rounded"></div>
              <span className="text-sm font-medium text-muted-foreground">AI Powered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
