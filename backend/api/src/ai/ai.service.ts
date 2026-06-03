import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import type Anthropic from '@anthropic-ai/sdk';
import type OpenAI from 'openai';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Anthropic } = require('@anthropic-ai/sdk');
      this.anthropic = new Anthropic({ apiKey: config.get('ANTHROPIC_API_KEY') });
    } catch { this.logger.warn('Anthropic SDK not available'); }

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: OpenAI } = require('openai');
      this.openai = new OpenAI({ apiKey: config.get('OPENAI_API_KEY') });
    } catch { this.logger.warn('OpenAI SDK not available'); }
  }

  async createSession(userId: string, title: string) {
    return this.prisma.aISession.create({
      data: { userId, title },
    });
  }

  async getSessions(userId: string) {
    return this.prisma.aISession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });
  }

  async getSession(id: string) {
    const session = await this.prisma.aISession.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!session) throw new NotFoundException(`AI session ${id} not found`);
    return session;
  }

  async chat(sessionId: string, userId: string, message: string) {
    const session = await this.getSession(sessionId);

    // Store user message
    await this.prisma.aIMessage.create({
      data: { sessionId, role: 'user', content: message },
    });

    // Build conversation history
    const history = session.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    history.push({ role: 'user', content: message });

    const reply = await this.callLLM(history);

    // Store assistant reply
    const stored = await this.prisma.aIMessage.create({
      data: { sessionId, role: 'assistant', content: reply },
    });

    return stored;
  }

  async generateLesson(topic: string, grade?: string, duration?: number) {
    const prompt = `Create a detailed lesson plan for: "${topic}"
${grade ? `Grade level: ${grade}` : ''}
${duration ? `Duration: ${duration} minutes` : ''}

Include: learning objectives, introduction, main content (with examples), activities, and assessment.`;
    return { content: await this.callLLM([{ role: 'user', content: prompt }]) };
  }

  async generateQuiz(topic: string, count = 5) {
    const prompt = `Generate ${count} quiz questions about "${topic}".
Return ONLY valid JSON array:
[
  {
    "type": "MCQ",
    "text": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "points": 10
  }
]`;

    const raw = await this.callLLM([{ role: 'user', content: prompt }]);
    try {
      const json = raw.match(/\[.*\]/s)?.[0];
      return { questions: json ? JSON.parse(json) : [] };
    } catch {
      return { questions: [] };
    }
  }

  async generateSummary(text: string) {
    const prompt = `Summarise the following educational content concisely, highlighting key concepts:\n\n${text}`;
    return { content: await this.callLLM([{ role: 'user', content: prompt }]) };
  }

  async generateMindMap(topic: string) {
    const prompt = `Create a mind map structure for "${topic}" as a JSON tree:
{ "center": "${topic}", "branches": [{ "label": "Branch", "children": ["leaf1", "leaf2"] }] }`;
    const raw = await this.callLLM([{ role: 'user', content: prompt }]);
    try {
      const json = raw.match(/\{.*\}/s)?.[0];
      return { mindMap: json ? JSON.parse(json) : { center: topic, branches: [] } };
    } catch {
      return { mindMap: { center: topic, branches: [] } };
    }
  }

  private async callLLM(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
    if (this.anthropic && this.config.get('ANTHROPIC_API_KEY')) {
      try {
        const resp = await this.anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 2048,
          system: 'You are an expert educational AI assistant. Provide clear, accurate, and pedagogically sound responses.',
          messages,
        });
        return resp.content[0]?.text ?? '';
      } catch (e) {
        this.logger.warn('Anthropic failed, trying OpenAI', e);
      }
    }

    if (this.openai && this.config.get('OPENAI_API_KEY')) {
      try {
        const resp = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          max_tokens: 2048,
          messages: [
            { role: 'system', content: 'You are an expert educational AI assistant.' },
            ...messages,
          ],
        });
        return resp.choices[0]?.message?.content ?? '';
      } catch (e) {
        this.logger.warn('OpenAI failed, using mock', e);
      }
    }

    return this.mockResponse(messages[messages.length - 1]?.content ?? '');
  }

  private mockResponse(prompt: string): string {
    return `This is a demo AI response for: "${prompt.slice(0, 80)}..."

In a production environment with API keys configured, this would provide detailed educational content. The platform supports Claude (Anthropic) as the primary AI and GPT-4o (OpenAI) as a fallback.`;
  }
}
