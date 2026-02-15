import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { FileText, Zap, Sparkles, ArrowRight, History } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/')({
  component: HomePage,
})

async function uploadCV(file: File): Promise<{ reviewId: string; filename: string; review: unknown }> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/review-cv', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const data = await response.json()

  // Generate UUID
  const reviewId = crypto.randomUUID()

  // Save to localStorage
  const reviewData = {
    id: reviewId,
    filename: data.filename,
    review: data.review,
    createdAt: new Date().toISOString()
  }
  localStorage.setItem(`cv-review-${reviewId}`, JSON.stringify(reviewData))

  return { reviewId, filename: data.filename, review: data.review }
}

function HomePage() {
  const navigate = useNavigate()
  const mutation = useMutation({
    mutationFn: uploadCV,
    onSuccess: (data) => {
      toast.success('CV reviewed successfully!', {
        description: 'Redirecting to results...',
      })
      setTimeout(() => {
        navigate({ to: '/cv-review/$id', params: { id: data.reviewId } })
      }, 1500)
    },
    onError: (error) => {
      toast.error('Failed to upload CV', {
        description: 'Please try again with a valid PDF file.',
      })
      console.error('Upload error:', error)
    },
  })

  const handleFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/pdf'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        console.log('Selected file:', file.name)

        // Save PDF to session storage for preview using FileReader
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            // Remove data:application/pdf;base64, prefix
            resolve(result.split(',')[1])
          }
          reader.readAsDataURL(file)
        })
        sessionStorage.setItem('uploaded-pdf', base64)

        // Show loading toast
        toast.message('Uploading and analyzing your CV...', {
          description: 'This may take a few seconds',
        })

        mutation.mutate(file)
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Full Width */}
      <header className="w-full px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-black tracking-tight">Roastmycv</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/history' })}>
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </nav>
      </header>

      {/* Hero Section - Full Height */}
      <main className="min-h-[calc(100vh-180px)] flex flex-col justify-center container mx-auto max-w-md px-4 py-16">
        {/* Text Content */}
        <div className="text-center space-y-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Professional CV Feedback
            <br />
            <span className="text-primary">On-Demand</span>
          </h1>
          <p className="text-base text-muted-foreground">
            Get expert insights on your CV whenever you need. No subscription — pay only per review.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={handleFileUpload}
              disabled={mutation.isPending}
              className="gap-2"
            >
              {mutation.isPending ? (
                <>
                  <Spinner className="w-4 h-4" />
                  Analyzing CV...
                </>
              ) : (
                <>
                  Review My CV
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-8 py-2">
              Learn How It Works
            </a>
          </div>

          {/* Feature Icons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Instant Results</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Pay Per Use</span>
            </div>
          </div>
        </div>
      </main>

      {/* How It Works Section - Scrollable below */}
      <div id="how-it-works" className="w-full px-4 py-24 scroll-mt-20">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Get professional CV feedback in three simple steps — 2 STX per review, no subscription
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'Upload Your CV', desc: 'Select your CV file (PDF, DOC, or TXT)' },
              { icon: Sparkles, title: 'AI Analysis', desc: 'Our AI reviews your CV for improvements' },
              { icon: Zap, title: 'Get Feedback', desc: 'Receive detailed, actionable insights' },
            ].map((step, i) => (
              <Card key={i} className="bg-card/50">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer - Full Width */}
      <footer className="w-full border-t py-6 px-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>Powered by x402-Stacks — Pay per review, no subscriptions</p>
        </div>
      </footer>
    </div>
  )
}
