---
theme: default
background: '#ffffff'
title: RoastMyCV
titleTemplate: '%s - AI Resume Reviewer with x402'
author: RoastMyCV
aspectRatio: '16/9'
color: '#1a1a1a'
accentColor: '#f97316'
---

# RoastMyCV

## AI-Powered Resume Reviewer

<div class="accent-bar"></div>

Powered by **x402** on Stacks Blockchain

---

# The Problem

## Your CV deserves better than the trash folder

<div class="accent-bar"></div>

**87%** of resumes are rejected in **6 seconds**

Most job seekers don't know what's wrong with their resume

---

# Introducing RoastMyCV

## Upload your PDF, get brutally honest feedback

<div class="features">
- **The Hard Truth** - Blunt 3-sentence summary
- **Section Scores** - Clarity, Impact, Hireability (1-10)
- **The Delete List** - Things to remove
- **Power Rewrite** - Example improvements
- **Critical Change** - One thing to fix in 30 minutes
</div>

---

# Demo

<div class="demo-box">

## [INSERT YOUR DEMO VIDEO HERE]

Show:
1. Upload interface
2. AI analysis results
3. Scoring cards
4. Feedback sections

</div>

---

# x402 Payment Integration

## Built on Stacks Blockchain

<div class="grid-2">
<div>

**How it works:**
- **2 STX** per review
- **HTTP 402** - Payment Required
- **No accounts** - pay-per-use
- **Demo mode** for testing

</div>
<div class="code-box">

```typescript
// Server checks for payment
if (!payment && !isDemo) {
  return new Response(null, {
    status: 402,
    headers: {
      'x-payment-required': '2 STX',
      'x-payment-address': 'SP...'
    }
  })
}
```

</div>
</div>

---

# Why x402?

## The Future of API Payments

<div class="benefits">
- **Micro-payments** - Pay only for what you use
- **No middleman** - Direct to developer
- **Programmable** - Flexible payment logic
- **Blockchain** - Transparent & verifiable
</div>

---

# Tech Stack

<div class="tech-grid">
<div class="tech">TanStack Start</div>
<div class="tech">React</div>
<div class="tech">TypeScript</div>
<div class="tech">Tailwind</div>
<div class="tech">shadcn/ui</div>
<div class="tech">OpenRouter</div>
<div class="tech">x402-stacks</div>
<div class="tech">PDF Parse</div>
</div>

---

# Use Cases

<div class="use-cases">
<div class="use-case">Job Seekers</div>
<div class="use-case">Career Changers</div>
<div class="use-case">Recent Graduates</div>
<div class="use-case">Professionals</div>
</div>

---

# Try It Now

<div class="cta">

## roastmycv.com

<div class="accent-bar"></div>

Demo mode available - test free

**2 STX** per real review

</div>

---

# Thank You

<div class="accent-bar"></div>

**Built with x402 on Stacks**

Questions?


.slidev-layout {
  font-family: 'Inter', system-ui, sans-serif;
  padding: 2rem 4rem;
}

h1 {
  font-size: 3.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

h2 {
  font-size: 2.2rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

p, li {
  font-size: 1.3rem;
  line-height: 1.7;
  color: #4a4a4a;
}

.accent-bar {
  width: 60px;
  height: 5px;
  background: #f97316;
  margin: 1rem 0;
  border-radius: 3px;
}

.features li, .benefits li {
  margin-bottom: 0.6rem;
  padding-left: 1.5rem;
  position: relative;
}

.features li::before, .benefits li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 8px;
  height: 8px;
  background: #f97316;
  border-radius: 50%;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.code-box {
  background: #1a1a1a;
  padding: 1.2rem;
  border-radius: 8px;
  overflow-x: auto;
}

.code-box pre {
  font-size: 0.85rem;
  color: #e5e5e5;
  margin: 0;
  font-family: 'Fira Code', monospace;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.tech {
  background: #fff7ed;
  color: #f97316;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  border: 1px solid #fed7aa;
}

.use-cases {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.use-case {
  background: #f97316;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
}

.cta {
  text-align: center;
  margin-top: 2rem;
}

.cta h2 {
  font-size: 3.5rem;
}

.demo-box {
  background: #f5f5f5;
  padding: 3rem;
  border-radius: 12px;
  text-align: center;
  border: 2px dashed #ccc;
}

.demo-box h3 {
  color: #999;
}
</style>
