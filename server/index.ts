import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import { callPerplexityAPI } from '../src/lib/jina'

dotenv.config()

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 5174
const DEMO_MODE = process.env.DEMO_MODE === 'true'

app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

app.post('/api/chat', async (req, res) => {
  try {
    const { query, model, reasoning_effort } = req.body || {}
    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }

    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 800))
      return res.json({
        response: `# Demo Response for: "${query}"

This is a **demo response** to show how the application works when the Jina AI API is not available.

## Features Demonstrated:
- Markdown formatting with **bold** and *italic* text
- Code blocks:
\`\`\`javascript
console.log("Hello from demo mode!")
\`\`\`

- Lists:
  1. PDF export functionality
  2. DOCX export functionality
  3. Beautiful markdown rendering

> This is a blockquote to show styled content`,
        usage: { prompt_tokens: 50, completion_tokens: 100, total_tokens: 150 },
      })
    }

    const data = await callPerplexityAPI(query, { model, reasoning_effort })
    const assistantMessage = data?.choices?.[0]?.message?.content || 'No response received'
    const sources = Array.isArray(data?.search_results) ? data.search_results.map((result: any) => result.url) : []
    res.json({ response: assistantMessage, usage: data?.usage, sources })
  } catch (error: any) {
    console.error('API Error:', error)
    let status = 500
    let message = 'Failed to process request'
    const msg = error?.message || ''
    if (msg.includes('timed out')) message = 'Request timed out. Please try again.'
    else if (msg.includes('ENOTFOUND')) message = 'Network error: Unable to connect to Jina AI service.'
    else if (msg.includes('ECONNRESET')) message = 'Connection was reset. Try again.'
    else if (msg.includes('401')) message = 'Authentication failed. Please check the API key.'
    else if (msg.includes('429')) message = 'Rate limit exceeded. Please wait and retry.'
    else if (msg.includes('402') || msg.includes('Payment required')) message = 'API quota exceeded.'
    if (error?.status && Number.isInteger(error.status)) status = error.status
    console.error('Sending error response:', { status, message, originalError: msg })
    res.status(status).json({ error: message })
  }
})

// Serve static assets in production (optional)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${port}`)
})


