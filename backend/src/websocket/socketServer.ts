// src/websocket/socketServer.ts
import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { socketAuthMiddleware } from '../middlewares/socketAuth.middleware';
import logger from '../utils/logger';

export class WebSocketServer {
  private io: SocketServer;

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.use(socketAuthMiddleware);

    this.io.on('connection', (socket: Socket) => {
      logger.info(`New client connected: ${socket.id}`);

      // Kullanıcıyı özel bir odaya ekle
      if (socket.data.user && socket.data.user.userId) {
        socket.join(`user_${socket.data.user.userId}`);
      }

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      // Örnek: Özel mesaj gönderme
      socket.on('private_message', (data: { to: string, message: string }) => {
        this.io.to(`user_${data.to}`).emit('private_message', {
          from: socket.data.user.userId,
          message: data.message
        });
      });

      // Örnek: Genel mesaj yayınlama
      socket.on('broadcast_message', (message: string) => {
        this.io.emit('broadcast_message', {
          from: socket.data.user.userId,
          message: message
        });
      });

      // Diğer olay dinleyicileri buraya eklenebilir
    });
  }

  public getIO(): SocketServer {
    return this.io;
  }

  // Belirli bir kullanıcıya mesaj gönderme metodu
  public sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Tüm bağlı kullanıcılara mesaj yayınlama metodu
  public broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  // 'emit' metodu ekleme
  public emit(event: string, data: any): void {
    this.io.emit(event, data);
  }
}
