import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket, MessageBody,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/realtime' })
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server

  private connectedUsers = new Map<string, string>() // socketId -> userId

  constructor(private jwt: JwtService, private config: ConfigService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token as string
      const payload = this.jwt.verify(token, { secret: this.config.get('JWT_SECRET') }) as any
      this.connectedUsers.set(client.id, payload.sub)
      client.join(`user:${payload.sub}`)
      client.emit('connected', { userId: payload.sub })
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id)
  }

  @SubscribeMessage('join-session')
  handleJoinSession(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string }) {
    client.join(`session:${data.sessionId}`)
    this.server.to(`session:${data.sessionId}`).emit('user-joined', {
      userId: this.connectedUsers.get(client.id),
    })
  }

  @SubscribeMessage('leave-session')
  handleLeaveSession(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string }) {
    client.leave(`session:${data.sessionId}`)
    this.server.to(`session:${data.sessionId}`).emit('user-left', {
      userId: this.connectedUsers.get(client.id),
    })
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string; message: string }) {
    this.server.to(`session:${data.sessionId}`).emit('chat-message', {
      userId: this.connectedUsers.get(client.id),
      message: data.message,
      timestamp: new Date().toISOString(),
    })
  }

  @SubscribeMessage('raise-hand')
  handleRaiseHand(@ConnectedSocket() client: Socket, @MessageBody() data: { sessionId: string }) {
    this.server.to(`session:${data.sessionId}`).emit('hand-raised', {
      userId: this.connectedUsers.get(client.id),
    })
  }

  // Notify a specific user (e.g. new grade, new message)
  notifyUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload)
  }
}
