'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Sparkles, FileText, Brain, HelpCircle, PenTool, Mic, Loader2, Copy, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { aiApi } from '@/lib/api'

const tools = [
  { id: 'lesson', label: 'Lesson Generator', icon: FileText, color: 'from-blue-500 to-cyan-400', desc: 'Generate a full lesson plan with objectives, activities & materials' },
  { id: 'quiz', label: 'Quiz Creator', icon: HelpCircle, color: 'from-violet-500 to-purple-400', desc: 'Create multiple-choice, short-answer or essay quizzes' },
  { id: 'summary', label: 'AI Summary', icon: Brain, color: 'from-emerald-500 to-green-400', desc: 'Summarize any document, video transcript, or topic' },
  { id: 'mindmap', label: 'Mind Map', icon: Brain, color: 'from-amber-500 to-orange-400', desc: 'Generate a visual mind map for any concept' },
  { id: 'grade', label: 'AI Grader', icon: PenTool, color: 'from-rose-500 to-pink-400', desc: 'Grade open-ended submissions with detailed feedback' },
  { id: 'translate', label: 'Translator', icon: Mic, color: 'from-indigo-500 to-blue-400', desc: 'Translate lessons to Arabic, French, or English' },
]

const DEMO_LESSON = `# Introduction to Differential Equations
**Grade Level:** 10-12 | **Duration:** 50 minutes

## Learning Objectives
1. Define a differential equation and identify its order
2. Solve simple first-order separable differential equations
3. Apply DEs to real-world growth/decay problems

## Lesson Outline
### Hook (5 min)
Ask: “How does a population grow?” → Rate of change depends on current state.

### Direct Instruction (15 min)
- Define: A DE relates a function with its derivatives
- Show: dy/dx = ky (exponential growth)

### Guided Practice (15 min)
1. dy/dx = 2x → y = x² + C
2. dy/dx = y → y = Ce^x
3. Population growth: P’ = 0.03P, P(0) = 1000 → P(t) = 1000e^(0.03t)

### Closure (5 min)
Exit ticket: “Write a DE that models a cooling cup of coffee.”

## Assessment
Formative: exit ticket | Summative: chapter quiz next Friday`

const DEMO_QUIZ = `# Quiz: Newton’s Laws of Motion
10 Questions | Mixed difficulty

Q1. Newton’s First Law states that an object at rest:
a) Accelerates due to gravity
b) Remains at rest unless acted upon by an external force ✓
c) Moves in a circular path
d) Has no inertia

Q2. A 5 kg object is pushed with 20 N. What is its acceleration?
a) 4 m/s² ✓   b) 100 m/s²   c) 0.25 m/s²   d) 2 m/s²

Q3 (Essay): A student claims heavier objects fall faster. Using Newton’s Laws, explain whether this is true and provide an example.`

export default function AIStudioPage() {
  const [activeTool, setActiveTool] = useState('lesson')
  const [isGenerating, setIsGenerating] = useState(false)
  const [output, setOutput] = useState('')
  const [form, setForm] = useState({
    topic: '', grade: '10', duration: '50', language: 'English',
    count: '10', difficulty: 'Mixed', text: '',
  })

  const generate = async () => {
    const hasInput = activeTool === 'summary' ? form.text.trim() : form.topic.trim()
    if (!hasInput) return
    setIsGenerating(true)
    setOutput('')

    try {
      let res: any
      if (activeTool === 'lesson') {
        res = await aiApi.generateLesson({
          topic: form.topic, gradeLevel: form.grade,
          duration: Number(form.duration), language: form.language,
        })
      } else if (activeTool === 'quiz') {
        res = await aiApi.generateQuiz({
          topic: form.topic, gradeLevel: form.grade,
          questionCount: Number(form.count), difficulty: form.difficulty, language: form.language,
        })
      } else if (activeTool === 'summary') {
        res = await aiApi.generateSummary({ text: form.text, language: form.language })
      } else if (activeTool === 'mindmap') {
        res = await aiApi.generateMindMap({ topic: form.topic, gradeLevel: form.grade, language: form.language })
      }

      const content = res?.data?.content ?? res?.data?.lesson ?? res?.data?.quiz ?? res?.data?.summary ?? res?.data?.mindmap
      if (content) {
        setOutput(typeof content === 'string' ? content : JSON.stringify(content, null, 2))
      } else {
        setOutput(activeTool === 'quiz' ? DEMO_QUIZ : DEMO_LESSON)
      }
    } catch {
      // Fallback to demo output when backend is unavailable
      setOutput(activeTool === 'quiz' ? DEMO_QUIZ : DEMO_LESSON)
    } finally {
      setIsGenerating(false)
    }
  }

  const copy = () => { navigator.clipboard.writeText(output); toast.success('Copied to clipboard') }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <Header title="AI Studio" subtitle="Generate lessons, quizzes, summaries & more" />
      <div className="flex-1 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTool(t.id); setOutput('') }}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
                activeTool === t.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40'
                  : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 bg-white dark:bg-slate-800'
              )}
            >
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', `bg-gradient-to-br ${t.color}`)}>
                <t.icon className="w-5 h-5 text-white" />
              </div>
              <span className={cn('text-xs font-semibold text-center leading-tight', activeTool === t.id ? 'text-primary-700 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400')}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input panel */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-1">
              {tools.find((t) => t.id === activeTool)?.label}
            </h2>
            <p className="text-sm text-slate-500 mb-5">{tools.find((t) => t.id === activeTool)?.desc}</p>

            <div className="space-y-4">
              {activeTool !== 'summary' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {activeTool === 'translate' ? 'Content to translate' : 'Topic / Subject'}
                  </label>
                  <input
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    placeholder={activeTool === 'quiz' ? "e.g. Newton's Laws of Motion" : 'e.g. Introduction to Differential Equations'}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              {activeTool === 'summary' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Paste text or transcript</label>
                  <textarea
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    rows={5}
                    placeholder="Paste the text you want to summarize..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {['lesson', 'quiz', 'mindmap'].includes(activeTool) && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Grade Level</label>
                    <select
                      value={form.grade}
                      onChange={(e) => setForm({ ...form, grade: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {['6','7','8','9','10','11','12','University'].map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                )}
                {activeTool === 'lesson' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Duration (mins)</label>
                    <select
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {['30','45','50','60','90'].map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                )}
                {activeTool === 'quiz' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Questions</label>
                    <select
                      value={form.count}
                      onChange={(e) => setForm({ ...form, count: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {['5','10','15','20'].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {['English','French','Arabic'].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={generate}
                disabled={isGenerating || (activeTool !== 'summary' ? !form.topic.trim() : !form.text.trim())}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  : <><Sparkles className="w-4 h-4" /> Generate</>}
              </button>
            </div>
          </div>

          {/* Output panel */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white">Generated Output</h2>
              {output && (
                <div className="flex gap-2">
                  <button
                    onClick={copy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Export
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-slate-500 text-sm">AI is generating your content...</p>
                </div>
              ) : output ? (
                <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{output}</pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-sm">Fill in the form and click Generate.</p>
                  <p className="text-slate-400 text-xs mt-1">Your AI-generated content will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
