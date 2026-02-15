import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, ArrowLeft, FileText, Clock } from 'lucide-react'

interface ReviewData {
  id: string
  filename: string
  review: {
    hardTruth: string
    finalVerdict: {
      clarity: number
      impact: number
      hireability: number
    }
  }
  createdAt: string
}

export const Route = createFileRoute('/history')({
  component: HistoryPage,
})

function HistoryPage() {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState<ReviewData[]>([])

  useEffect(() => {
    const allReviews: ReviewData[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('cv-review-')) {
        const data = localStorage.getItem(key)
        if (data) {
          allReviews.push(JSON.parse(data))
        }
      }
    }
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setReviews(allReviews)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-4 py-6 border-b">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xl font-black tracking-tight">Roastmycv</span>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Review History</h1>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reviews yet</p>
            <Button className="mt-4" onClick={() => navigate({ to: '/' })}>
              Upload Your First CV
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card
                key={review.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate({ to: '/cv-review/$id', params: { id: review.id } })}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{review.filename}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(review.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Score:</span>
                      <span className="font-bold">
                        {Math.round(
                          (review.review.finalVerdict.clarity +
                            review.review.finalVerdict.impact +
                            review.review.finalVerdict.hireability) /
                            3
                        )}
                        /10
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
