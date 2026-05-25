import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AIService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async createSession(studentUserId: string, subject?: string) {
    const student = await this.prisma.student.findUniqueOrThrow({ where: { userId: studentUserId } })
    return this.prisma.aISession.create({
      data: { studentId: student.id, subject },
    })
  }

  async getSessions(studentUserId: string) {
    const student = await this.prisma.student.findUniqueOrThrow({ where: { userId: studentUserId } })
    return this.prisma.aISession.findMany({
      where: { studentId: student.id },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    })
  }

  async getSession(sessionId: string) {
    return this.prisma.aISession.findUniqueOrThrow({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
  }

  async chat(sessionId: string, userMessage: string): Promise<string> {
    const session = await this.prisma.aISession.findUniqueOrThrow({ where: { id: sessionId } })
    const history = await this.prisma.aIMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    })

    await this.prisma.aIMessage.create({
      data: { sessionId, role: 'user', content: userMessage },
    })

    const assistantReply = await this.callLLM(userMessage, history, session.subject ?? undefined)

    const saved = await this.prisma.aIMessage.create({
      data: { sessionId, role: 'assistant', content: assistantReply, tokensUsed: Math.ceil(assistantReply.length / 4) },
    })

    await this.prisma.aISession.update({
      where: { id: sessionId },
      data: { tokensUsed: { increment: saved.tokensUsed }, updatedAt: new Date() },
    })

    return assistantReply
  }

  async generateLesson(data: { topic: string; grade: string; duration: number; language: string }): Promise<string> {
    const prompt = `Generate a comprehensive lesson plan for a ${data.grade} grade class on the topic: "${data.topic}".
Duration: ${data.duration} minutes. Language: ${data.language}.
Include: learning objectives, materials, hook/intro, direct instruction, guided practice, independent practice, assessment, and differentiation strategies.`
    return this.callLLM(prompt, [])
  }

  async generateQuiz(data: { topic: string; count: number; difficulty: string }): Promise<string> {
    const prompt = `Create a ${data.count}-question quiz on "${data.topic}" at ${data.difficulty} difficulty.
Include a mix of multiple-choice, short answer, and at least one essay question. Mark correct answers for MCQs.`
    return this.callLLM(prompt, [])
  }

  async generateSummary(text: string): Promise<string> {
    const prompt = `Summarize the following text in clear bullet points, highlighting the 5 most important concepts:\n\n${text}`
    return this.callLLM(prompt, [])
  }

  async generateMindMap(topic: string): Promise<object> {
    const prompt = `Generate a mind map structure for the topic "${topic}" in JSON format with keys: title, branches (array of { label, sub-branches })`
    const raw = await this.callLLM(prompt, [])
    try {
      return JSON.parse(raw)
    } catch {
      return { title: topic, branches: [], raw }
    }
  }

  private async callLLM(
    userMessage: string,
    history: Array<{ role: string; content: string }>,
    subject?: string,
  ): Promise<string> {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY') || this.config.get<string>('OPENAI_API_KEY')
    if (!apiKey) {
      return this.mockResponse(userMessage)
    }

    try {
      // Try Anthropic (Claude) first
      const anthropicKey = this.config.get<string>('ANTHROPIC_API_KEY')
      if (anthropicKey) {
        return await this.callAnthropic(anthropicKey, userMessage, history, subject)
      }
      // Fallback to OpenAI
      const openaiKey = this.config.get<string>('OPENAI_API_KEY')
      if (openaiKey) {
        return await this.callOpenAI(openaiKey, userMessage, history, subject)
      }
    } catch (err) {
      console.error('LLM call failed:', err)
      return this.mockResponse(userMessage)
    }

    return this.mockResponse(userMessage)
  }

  private async callAnthropic(apiKey: string, userMessage: string, history: any[], subject?: string): Promise<string> {
    const systemPrompt = `You are an expert educational AI tutor${subject ? ` specializing in ${subject}` : ''}. Explain concepts clearly, use examples, and adapt to the student's level. Be encouraging and patient.`
    const messages = [
      ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: userMessage },
    ]

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: systemPrompt,
        messages,
      }),
    })

    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`)
    const data = await res.json() as any
    return data.content[0].text
  }

  private async callOpenAI(apiKey: string, userMessage: string, history: any[], subject?: string): Promise<string> {
    const systemPrompt = `You are an expert educational AI tutor${subject ? ` specializing in ${subject}` : ''}. Explain concepts clearly, use examples, and adapt to the student's level.`
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ]

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o', messages, max_tokens: 2048 }),
    })

    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`)
    const data = await res.json() as any
    return data.choices[0].message.content
  }

  private mockResponse(message: string): string {
    return `I understand your question about "${message.slice(0, 60)}...". This is a placeholder response — connect ANTHROPIC_API_KEY or OPENAI_API_KEY in your .env to enable real AI responses.`
  }
}
