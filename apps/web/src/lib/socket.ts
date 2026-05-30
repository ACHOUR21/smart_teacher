import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000', {
      namespace: '/realtime',
      auth: { token },
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function joinSession(sessionId: string) {
  getSocket().emit('join-session', { sessionId });
}

export function leaveSession(sessionId: string) {
  getSocket().emit('leave-session', { sessionId });
}

export function sendChatMessage(sessionId: string, message: string) {
  getSocket().emit('chat-message', { sessionId, message });
}

export function raiseHand(sessionId: string) {
  getSocket().emit('raise-hand', { sessionId });
}
