import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.socket?.emit('join_user_room', userId);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
}

export const socketService = new SocketService();
