import { createFileRoute } from '@tanstack/react-router'

if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1;
    e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true;

    constructor(init?: string | number[]) {
      if (init) {
        if (typeof init === 'string') {
          const parts = init.match(/matrix\((.*)\)/);
          if (parts) {
            const values = parts[1].split(',').map(Number);
            [this.a, this.b, this.c, this.d, this.e, this.f] = values;
          }
        } else if (Array.isArray(init)) {
          [this.m11, this.m12, this.m13, this.m14,
           this.m21, this.m22, this.m23, this.m24,
           this.m31, this.m32, this.m33, this.m34,
           this.m41, this.m42, this.m43, this.m44] = init;
        }
      }
    }

    multiply(other: DOMMatrix): DOMMatrix {
      const result = new DOMMatrix();
      result.m11 = this.m11 * other.m11 + this.m12 * other.m21 + this.m13 * other.m31 + this.m14 * other.m41;
      result.m12 = this.m11 * other.m12 + this.m12 * other.m22 + this.m13 * other.m32 + this.m14 * other.m42;
      result.m21 = this.m21 * other.m11 + this.m22 * other.m21 + this.m23 * other.m31 + this.m24 * other.m41;
      result.m22 = this.m21 * other.m12 + this.m22 * other.m22 + this.m23 * other.m32 + this.m24 * other.m42;
      return result;
    }

    translate(x: number, y: number, z = 0): DOMMatrix {
      const result = new DOMMatrix();
      result.m11 = this.m11; result.m12 = this.m12;
      result.m21 = this.m21; result.m22 = this.m22;
      result.m41 = this.m41 + x;
      result.m42 = this.m42 + y;
      return result;
    }

    scale(scaleX: number, scaleY: number): DOMMatrix {
      const result = new DOMMatrix();
      result.m11 = this.m11 * scaleX;
      result.m12 = this.m12 * scaleX;
      result.m21 = this.m21 * scaleY;
      result.m22 = this.m22 * scaleY;
      return result;
    }
  } as any;
}

export const Route = createFileRoute('/api/review-cv')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData()
          const file = formData.get('file')

          if (!file || !(file instanceof File)) {
            return Response.json(
              { error: 'No file provided' },
              { status: 400 }
            )
          }

          if (file.type !== 'application/pdf') {
            return Response.json(
              { error: 'Only PDF files are accepted' },
              { status: 400 }
            )
          }

          const arrayBuffer = await file.arrayBuffer()

          const pdfjs = await import('pdfjs-dist/legacy/build/pdf.min.mjs')
          await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs')

          const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
          const pdfDocument = await loadingTask.promise

          const extractedTextParts: string[] = []
          for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum)
            const textContent = await page.getTextContent()
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ')
            extractedTextParts.push(pageText)
          }

          const extractedText = extractedTextParts.join('\n')

          if (!extractedText || extractedText.trim().length === 0) {
            return Response.json(
              { error: 'Could not extract text from PDF' },
              { status: 400 }
            )
          }

          const maxChars = 8000
          const truncatedText = extractedText.length > maxChars
            ? extractedText.substring(0, maxChars) + '...'
            : extractedText

          const openRouterApiKey = process.env.OPENROUTER_API_KEY

          if (!openRouterApiKey) {
            return Response.json(
              { error: 'API key not configured' },
              { status: 500 }
            )
          }

          const prompt = `Role: You are an HR professional with 10 years of experience screening resumes for mid-level positions. You know what recruiters look for and what gets candidates called for interviews. You give honest, practical feedback that helps regular job seekers improve.

Objective: Review the CV and give practical feedback. Be direct and honest - if something needs work, say so clearly. Your goal is to help the candidate get more interviews.

Evaluation Focus:
- Does it read easily and quickly?
- Are achievements backed up with numbers or results?
- Is the language active and strong?
- Any red flags that might make recruiters pass?
- Will it pass computer screening (ATS)?

CV Content:
${truncatedText}

Provide your review in this JSON format:
{
  "hardTruth": "<3-sentence honest summary of what's wrong and why it might not get interviews>",
  "sectionCritique": {
    "professionalSummary": "<is it a wish list or does it sell the person?>",
    "experienceAchievements": "<which bullets are just tasks vs actual results>",
    "skillsTechStack": "<real skills vs stuff everyone lists>"
  },
  "deleteList": [<5 things to remove or fix>],
  "powerRewrite": "<rewrite the weakest bullet to sound more impressive with results>",
  "finalVerdict": {
    "clarity": <1-10: is it easy to read and scan>,
    "impact": <1-10: do achievements sound impressive with numbers/results>,
    "hireability": <1-10: how likely to get an interview>,
    "criticalChange": "<the one thing to fix in 30 minutes that will make the biggest difference>"
  }
}`

          const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openRouterApiKey}`,
              'HTTP-Referer': 'https://roastmycv.com',
              'X-Title': 'RoastMyCV',
            },
            body: JSON.stringify({
              model: 'openai/gpt-4o-mini',
              messages: [
                { role: 'user', content: prompt }
              ],
              temperature: 0.2,
              response_format: { type: 'json_object' }
            })
          })

          if (!aiResponse.ok) {
            return Response.json(
              { error: 'AI analysis failed' },
              { status: 500 }
            )
          }

          const aiData = await aiResponse.json()
          const aiText = aiData.choices?.[0]?.message?.content || ''

          let review
          try {
            review = JSON.parse(aiText)
          } catch {
            review = {
              hardTruth: 'Unable to parse AI response. Please try again.',
              sectionCritique: {
                professionalSummary: 'Analysis failed',
                experienceAchievements: 'Analysis failed',
                skillsTechStack: 'Analysis failed'
              },
              deleteList: ['Please try again or review manually'],
              powerRewrite: 'Analysis failed',
              finalVerdict: {
                clarity: 5,
                impact: 5,
                hireability: 5,
                criticalChange: 'Retry the analysis'
              }
            }
          }

          return Response.json({
            success: true,
            filename: file.name,
            review
          })

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          return Response.json(
            { error: 'Failed to process CV', details: errorMessage },
            { status: 500 }
          )
        }
      },
    },
  },
})
