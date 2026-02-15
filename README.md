# RoastMyCV

Get honest, professional CV feedback powered by AI. Upload your resume and receive detailed critiques to help you land more interviews.

## What is RoastMyCV?

RoastMyCV is a web application that provides on-demand, AI-powered CV/resume reviews. It analyzes your resume and gives you:

- **The Hard Truth**: A blunt 3-sentence summary of what's wrong
- **Section-by-Section Critique**: Detailed feedback on professional summary, experience/achievements, and skills
- **The Delete List**: Things to remove or fix
- **The Power Rewrite**: An example of how to make weak bullet points impactful
- **Scoring**: Clarity, Impact, and Hireability scores (1-10)
- **Critical Change**: The one thing to fix in 30 minutes that will make the biggest difference

## Use Cases

- **Job seekers** who want to improve their chances of getting interviews
- **Career changers** looking to optimize their CV for a new field
- **Recent graduates** wanting professional feedback on their first resume
- **Professionals** seeking to update and improve their existing CV

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React framework with SSR)
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based routing)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) + TanStack AI
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **PDF Parsing**: [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- **AI**: OpenRouter API (GPT-4o-mini)
- **Runtime**: Node.js with Nitro server

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- OpenRouter API key (for AI features)

## Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd roastmycv

# Install dependencies
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Required: Get your API key from https://openrouter.ai/
OPENROUTER_API_KEY=your_api_key_here
```

### 3. Run Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Project Structure

```
roastmycv/
├── src/
│   ├── routes/
│   │   ├── index.tsx           # Home page - upload CV
│   │   ├── history.tsx         # Review history page
│   │   ├── cv-review.$id.tsx   # Review results page
│   │   ├── api/
│   │   │   └── review-cv.ts    # CV review API endpoint
│   │   └── __root.tsx          # Root layout
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── utils.ts            # Utility functions
│   │   └── query-client.ts     # TanStack Query client
│   ├── hooks/                  # Custom React hooks
│   ├── router.tsx              # Router configuration
│   └── styles.css             # Global styles
├── public/                     # Static assets
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## How It Works

### 1. Upload CV
The user uploads a PDF file through the home page. The file is sent to the server via a form data POST request.

### 2. PDF Text Extraction
The server uses `pdf-parse` to extract text content from the PDF. Text is truncated to 8000 characters to respect AI token limits.

### 3. AI Analysis
The extracted text is sent to OpenRouter's GPT-4o-mini model with a detailed prompt that instructs the AI to act as an HR professional providing honest CV feedback.

### 4. Review Display
The review results are displayed with:
- PDF preview on the left (desktop)
- Review content on the right
- Scores and actionable feedback

### 5. History
Reviews are stored in localStorage so users can revisit them later.

## API Reference

### POST /api/review-cv

Uploads and analyzes a CV PDF.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (PDF file)

**Response:**
```json
{
  "success": true,
  "filename": "resume.pdf",
  "review": {
    "hardTruth": "...",
    "sectionCritique": {
      "professionalSummary": "...",
      "experienceAchievements": "...",
      "skillsTechStack": "..."
    },
    "deleteList": ["..."],
    "powerRewrite": "...",
    "finalVerdict": {
      "clarity": 7,
      "impact": 6,
      "hireability": 5,
      "criticalChange": "..."
    }
  }
}
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | API key from OpenRouter | Yes |

### Supported File Types

- PDF files only (`.pdf`)

### AI Model

By default, the app uses `openai/gpt-4o-mini`. You can change this in `src/routes/api/review-cv.ts`.

## Testing

Run tests with:

```bash
pnpm test
```

## License

MIT
