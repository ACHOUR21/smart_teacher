import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async getConversations(userId: string) {
    const participations = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } } },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    return participations.map((p) => ({
      id: p.conversation.id,
      updatedAt: p.conversation.updatedAt,
      lastMessage: p.conversation.messages[0] ?? null,
      participants: p.conversation.participants
        .filter((part) => part.userId !== userId)
        .map((part) => part.user),
    }));
  }

  async getOrCreateConversation(userId: string, otherUserId: string) {
    // Check if conversation already exists between these two users
    const existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
          // Ensure it's a 2-person conversation (no group chats)
          { participants: { every: { userId: { in: [userId, otherUserId] } } } },
        ],
      },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } } },
        },
        messages: { orderBy: { createdAt: 'asc' }, take: 50 },
      },
    });

    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId },
            { userId: otherUserId },
          ],
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } } },
        },
        messages: { orderBy: { createdAt: 'asc' }, take: 50 },
      },
    });
  }

  async getMessages(conversationId: string, userId: string, limit = 50, before?: string) {
    const participation = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participation) throw new ForbiddenException('Not a participant of this conversation');

    return this.prisma.message.findMany({
      where: {
        conversationId,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const participation = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: senderId } },
    });
    if (!participation) throw new ForbiddenException('Not a participant of this conversation');
    if (!content?.trim()) throw new NotFoundException('Message content cannot be empty');

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: { conversationId, senderId, content: content.trim() },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ]);
    return message;
  }
}
