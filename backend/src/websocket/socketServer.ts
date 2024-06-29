import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { socketAuthMiddleware } from '../middlewares/socketAuth.middleware';
import logger from '../utils/logger';

interface PrivateMessagePayload {
  to: string;
  message: string;
}

interface BroadcastMessagePayload {
  message: string;
}

export class WebSocketServer {
  private io: SocketServer;

  constructor(server: HttpServer) {
    if (!process.env.CLIENT_URL) {
      throw new Error('CLIENT_URL environment variable is missing');
    }

    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.use(socketAuthMiddleware);

    this.io.on('connection', (socket: Socket) => {
      logger.info(`New client connected: ${socket.id}`);

      if (socket.data.user && socket.data.user.userId) {
        socket.join(`user_${socket.data.user.userId}`);
      }

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });

      socket.on('private_message', (data: PrivateMessagePayload) => {
        try {
          this.io.to(`user_${data.to}`).emit('private_message', {
            from: socket.data.user.userId,
            message: data.message,
          });
        } catch (error) {
          logger.error(`Error sending private message: ${error}`);
        }
      });

      socket.on('broadcast_message', (data: BroadcastMessagePayload) => {
        try {
          this.io.emit('broadcast_message', {
            from: socket.data.user.userId,
            message: data.message,
          });
        } catch (error) {
          logger.error(`Error broadcasting message: ${error}`);
        }
      });

      // Diğer olay dinleyicileri buraya eklenebilir
    });
  }

  public getIO(): SocketServer {
    return this.io;
  }

  public sendToUser(userId: string, event: string, data: any): void {
    try {
      this.io.to(`user_${userId}`).emit(event, data);
    } catch (error) {
      logger.error(`Error sending message to user ${userId}: ${error}`);
    }
  }

  public broadcastToAll(event: string, data: any): void {
    try {
      this.io.emit(event, data);
    } catch (error) {
      logger.error(`Error broadcasting to all users: ${error}`);
    }
  }

  public emit(event: string, data: any): void {
    try {
      this.io.emit(event, data);
    } catch (error) {
      logger.error(`Error emitting event ${event}: ${error}`);
    }
  }
}
