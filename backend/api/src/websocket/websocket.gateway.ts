import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect,
  MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true },
  namespace: '/realtime',
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string);

      if (!token) { client.disconnect(); return; }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId: string = payload.sub;
      client.data.userId = userId;
      await client.join(`user:${userId}`);
      this.logger.log(`WS connected: ${client.id} → user:${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WS disconnected: ${client.id} (user:${client.data?.userId ?? '?'})`);
  }

  @SubscribeMessage('join-session')
  async handleJoinSession(
    @MessageBody() payload: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`session:${payload.sessionId}`);
    this.server.to(`session:${payload.sessionId}`).emit('user-joined', {
      userId: client.data.userId, sessionId: payload.sessionId, at: new Date().toISOString(),
    });
    return { status: 'joined', sessionId: payload.sessionId };
  }

  @SubscribeMessage('leave-session')
  async handleLeaveSession(
    @MessageBody() payload: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`session:${payload.sessionId}`);
    this.server.to(`session:${payload.sessionId}`).emit('user-left', {
      userId: client.data.userId, sessionId: payload.sessionId, at: new Date().toISOString(),
    });
    return { status: 'left', sessionId: payload.sessionId };
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(
    @MessageBody() payload: { sessionId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`session:${payload.sessionId}`).emit('chat-message', {
      userId: client.data.userId, content: payload.content,
      sessionId: payload.sessionId, at: new Date().toISOString(),
    });
    return { status: 'sent' };
  }

  @SubscribeMessage('raise-hand')
  handleRaiseHand(
    @MessageBody() payload: { sessionId: string; raised?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`session:${payload.sessionId}`).emit('hand-raised', {
      userId: client.data.userId, raised: payload.raised ?? true,
      sessionId: payload.sessionId, at: new Date().toISOString(),
    });
    return { status: 'broadcast' };
  }

  /** Push a server-initiated event to a specific user room */
  notifyUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
