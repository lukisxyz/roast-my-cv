import { createFileRoute } from '@tanstack/react-router'
import { PDFParse } from 'pdf-parse'

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

          // Validate file type
          if (file.type !== 'application/pdf') {
            return Response.json(
              { error: 'Only PDF files are accepted' },
              { status: 400 }
            )
          }

          // Read file as buffer
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          // Parse PDF
          const parser = new PDFParse({ data: buffer })
          const result = await parser.getText()
          const extractedText = result.text

          await parser.destroy()

          if (!extractedText || extractedText.trim().length === 0) {
            return Response.json(
              { error: 'Could not extract text from PDF' },
              { status: 400 }
            )
          }

          // Truncate text if too long (AI has token limits)
          const maxChars = 8000
          const truncatedText = extractedText.length > maxChars
            ? extractedText.substring(0, maxChars) + '...'
            : extractedText

          // Generate CV review using OpenRouter API directly
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
            const errorData = await aiResponse.json()
            console.error('OpenRouter error:', errorData)
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
          console.error('CV review error:', error)
          return Response.json(
            { error: 'Failed to process CV' },
            { status: 500 }
          )
        }
      },
    },
  },
})
