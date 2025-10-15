import React, { useEffect, useMemo, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

type Step = 1 | 2 | 3
const limit = 280

const moods = [
  { key:'Cheerful', icon:'😊', desc:'Upbeat & friendly' },
  { key:'Calm', icon:'🧘', desc:'Gentle & soft' },
  { key:'Focused', icon:'🎯', desc:'Crisp & concise' },
  { key:'Motivational', icon:'⚡', desc:'Action-oriented' },
  { key:'Witty', icon:'😄', desc:'Light humor' },
  { key:'Serious', icon:'🧊', desc:'Neutral & data-driven' }
] as const

const categories = [
  { key:'Good Morning', icon:'☀️' },
  { key:'Crypto News', icon:'📈' },
  { key:'Web3 Tip', icon:'🛠️' },
  { key:'Motivation', icon:'💪' },
  { key:'Daily Summary', icon:'📝' },
  { key:'Meme', icon:'😄' }
] as const

export default function App(){
  const [step,setStep] = useState<Step>(1)
  const [mood,setMood] = useState<string>('')
  const [category,setCategory] = useState<string>('')
  const [cast,setCast] = useState<string>('')
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState<string>('')

  useEffect(()=>{ (async()=>{ await sdk.actions.ready() })() },[])

  const headerTitle = useMemo(()=>{
    if(step===1) return 'Pick your mood'
    if(step===2) return 'Pick a category'
    return 'Preview & post'
  },[step])

  async function generateCast(m: string, c: string){
    if (!m || !c) return
    try{
      setLoading(true)
      setError('')
      setCast('Generating…')
      const res = await fetch('/api/generate',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ mood: m, category: c })
      })
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as { castText?: string; error?: string }
      const txt = (data.castText ?? '').slice(0,limit)
      if(!txt) throw new Error(data.error || 'Empty response')
      setCast(txt)
    }catch(e:any){
      console.error('generateCast error', e)
      setError('Generation failed. Please try again.')
      setCast('')
    }finally{
      setLoading(false)
    }
  }

  async function postCast(){
    const text = cast.trim()
    if(!text) return alert('Write something first!')
    await sdk.actions.cast(text)
    alert('✅ Cast posted!')
  }

  return (
    <div className="wrap">
      <header className="bar">
        <div className="mark">MC</div>
        <div className="titles">
          <h1>MoodCaster</h1>
          <p>English-only • Mood → Category → AI Cast → Post</p>
        </div>
      </header>

      <main className="card">
        <div className="head">
          <h2>{headerTitle}</h2>
          <div className="tags">
            {mood && <span className="tag">{mood}</span>}
            {category && <span className="tag">{category}</span>}
          </div>
        </div>

        {step===1 && (
          <div className="grid">
            {moods.map(m => (
              <button key={m.key} className={`pill ${mood===m.key?'active':''}`}
                onClick={()=>{ setMood(m.key); setCategory(''); setCast(''); setStep(2) }}>
                <span className="emoji">{m.icon}</span>
                <span className="pill-title">{m.key}</span>
                <span className="pill-desc">{m.desc}</span>
              </button>
            ))}
          </div>
        )}

        {step===2 && (
          <div className="grid">
            {categories.map(c => (
              <button key={c.key} className={`pill ${category===c.key?'active':''}`}
                onClick={()=>{ setCategory(c.key); setStep(3); generateCast(mood, c.key) }}>
                <span className="emoji">{c.icon}</span>
                <span className="pill-title">{c.key}</span>
                <span className="pill-desc">AI will draft for you</span>
              </button>
            ))}
          </div>
        )}

        {step===3 && (
          <div className="compose">
            <textarea
              value={cast}
              onChange={e=>setCast(e.target.value.slice(0,limit))}
              placeholder="Your AI cast will appear here…"
              rows={5}
            />
            <div className="row">
              <span className="muted">{cast.length}/{limit}</span>
              <div className="spacer" />
              <button className="btn ghost" onClick={()=>{ setStep(1); setMood(''); setCategory(''); setCast('') }}>Reset</button>
              <button className="btn" disabled={loading} onClick={()=>generateCast(mood, category)}>↻ Regenerate</button>
              <button className="btn primary" disabled={loading || !cast.trim()} onClick={postCast}>Post</button>
            </div>
            {error && <div className="error">{error}</div>}
          </div>
        )}
      </main>

      <footer className="foot">Farcaster Mini App · Built for Base</footer>
    </div>
  )
}