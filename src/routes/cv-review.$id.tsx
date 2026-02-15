import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, ArrowLeft, Save, CheckCircle } from 'lucide-react'

interface ReviewData {
  id: string
  filename: string
  review: {
    hardTruth: string
    sectionCritique: {
      professionalSummary: string
      experienceAchievements: string
      skillsTechStack: string
    }
    deleteList: string[]
    powerRewrite: string
    finalVerdict: {
      clarity: number
      impact: number
      hireability: number
      criticalChange: string
    }
  }
  createdAt: string
}

export const Route = createFileRoute('/cv-review/$id')({
  component: ReviewPage,
})

function ReviewPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<ReviewData | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(`cv-review-${id}`)
    if (stored) {
      const parsed = JSON.parse(stored) as ReviewData
      setData(parsed)
    }
  }, [id])

  useEffect(() => {
    const pdfData = sessionStorage.getItem('uploaded-pdf')
    if (pdfData) {
      const binaryString = atob(pdfData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)

      return () => URL.revokeObjectURL(url)
    }
  }, [])

  const handleSave = () => {
    setIsSaved(true)
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Review not found</p>
        <Button onClick={() => navigate({ to: '/history' })}>
          Go to History
        </Button>
      </div>
    )
  }

  const review = data.review

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-4 py-4 border-b flex items-center justify-between shrink-0">
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-xl font-black tracking-tight">Roastmycv</span>
          </div>
        </nav>
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/history' })}>
          History
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - PDF Preview (hidden on mobile) */}
        <div className="hidden lg:block w-1/2 h-full border-r bg-muted/20">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0`}
              className="w-full h-full"
              title="PDF Preview"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">No PDF Preview</p>
                <p className="text-sm">Upload a PDF to see preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Right - Review Content (scrollable) */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* File Info & Save */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{data.filename}</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(data.createdAt).toLocaleString()}
                </p>
              </div>
              <Button onClick={handleSave} disabled={isSaved}>
                {isSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>

            {/* Hard Truth */}
            <Card className="border-red-500/50 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-red-600 text-lg">THE HARD TRUTH</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{review.hardTruth}</p>
              </CardContent>
            </Card>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary">{review.finalVerdict.clarity}<span className="text-lg">/10</span></div>
                  <div className="text-xs text-muted-foreground mt-1">Clarity</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary">{review.finalVerdict.impact}<span className="text-lg">/10</span></div>
                  <div className="text-xs text-muted-foreground mt-1">Impact</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary">{review.finalVerdict.hireability}<span className="text-lg">/10</span></div>
                  <div className="text-xs text-muted-foreground mt-1">Hireability</div>
                </CardContent>
              </Card>
            </div>

            {/* Section Critique */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Section-by-Section Critique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">Professional Summary</h4>
                  <p className="text-sm text-muted-foreground">{review.sectionCritique.professionalSummary}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Experience & Achievements</h4>
                  <p className="text-sm text-muted-foreground">{review.sectionCritique.experienceAchievements}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">Skills/Tech Stack</h4>
                  <p className="text-sm text-muted-foreground">{review.sectionCritique.skillsTechStack}</p>
                </div>
              </CardContent>
            </Card>

            {/* Delete List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-orange-600">THE "DELETE" LIST</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {review.deleteList.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-red-500">×</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Power Rewrite */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">THE POWER REWRITE</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic text-muted-foreground">{review.powerRewrite}</p>
              </CardContent>
            </Card>

            {/* Critical Change */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">CRITICAL CHANGE</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{review.finalVerdict.criticalChange}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
