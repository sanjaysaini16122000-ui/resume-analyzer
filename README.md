# AI Resume Analyzer

Next.js app that analyzes a resume with Google Gemini and returns:

- Overall score, ATS score and (optional) job match score
- Strengths and weaknesses
- Matched and missing keywords
- Section-by-section feedback
- Prioritized improvements with example rewrites

Upload a PDF (up to 4 MB) or paste text. Add a job description to get a match score.

## Run locally

```bash
npm install
cp .env.example .env.local
# put your key in .env.local (free key: https://aistudio.google.com -> Get API key)
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Go to vercel.com, click **Add New -> Project** and import the repo.
3. Under **Environment Variables** add `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`).
4. Click **Deploy**.

Or with the CLI:

```bash
npm i -g vercel
vercel
vercel env add GEMINI_API_KEY
vercel --prod
```

## Notes

- The API key is only used on the server (`app/api/analyze/route.js`). Never expose it in client code.
- PDFs are sent straight to Gemini, so no extra PDF parsing library is needed. Scanned PDFs work too.
- Vercel limits request bodies to about 4.5 MB, which is why uploads are capped at 4 MB.
- The built-in rate limiter is in-memory and best effort. For real traffic, use something like Upstash Redis.
- If you see 429 errors, the free Gemini quota is exhausted. Wait, or change `GEMINI_MODEL`.
