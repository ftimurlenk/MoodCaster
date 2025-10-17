import dotenv from 'dotenv'
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env' : '.env.local' })

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import Groq from 'groq-sdk'

const app = express()
app.use(cors())
app.use(bodyParser.json())

const apiKey = process.env.GROQ_API_KEY
if (!apiKey) {
  console.error('❌ GROQ_API_KEY is missing. Create .env.local with GROQ_API_KEY=...')
  process.exit(1)
}
const MODEL_ID = process.env.GROQ_MODEL_ID || 'llama-3.1-8b-instant'
const groq = new Groq({ apiKey })

app.get('/api/health', (_req, res) => res.json({ ok: true, model: MODEL_ID }))

app.post('/api/generate', async (req, res) => {
  try{
    const { mood, category } = req.body || {}
    if (!mood || !category) {
      return res.status(400).json({ castText: '', error: 'mood and category are required' })
    }

    console.log('generate:', { mood, category })

    const prompt = `You are MoodCaster, an English-only Farcaster copywriter.
Mood: ${mood}
Category: ${category}
Write ONE short cast (<= 280 chars) in English only.
Friendly tone, no hashtags, no markdown, no financial advice.`

    const r = await groq.chat.completions.create({
      model: MODEL_ID,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 120
    })
    const castText = r.choices?.[0]?.message?.content?.trim()
    if(!castText) throw new Error('Empty Groq response')
    res.json({ castText })
  }catch(e:any){
    console.error('Groq error:', e?.response?.data ?? e?.message ?? e)
    res.status(500).json({
      castText: '',
      error: e?.response?.data ?? e?.message ?? 'Unknown error'
    })
  }
})

const PORT = Number(process.env.PORT ?? 3000)
app.listen(PORT, ()=> console.log(`API on http://localhost:${PORT} (model: ${MODEL_ID})`))