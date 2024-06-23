"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketServer = void 0;
const socket_io_1 = require("socket.io");
const socketAuth_middleware_1 = require("../middlewares/socketAuth.middleware");
const logger_1 = __importDefault(require("../utils/logger"));
class WebSocketServer {
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.CLIENT_URL,
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        this.io.use(socketAuth_middleware_1.socketAuthMiddleware);
        this.io.on('connection', (socket) => {
            logger_1.default.info(`New client connected: ${socket.id}`);
            // Kullanıcıyı özel bir odaya ekle
            if (socket.data.user && socket.data.user.userId) {
                socket.join(`user_${socket.data.user.userId}`);
            }
            socket.on('disconnect', () => {
                logger_1.default.info(`Client disconnected: ${socket.id}`);
            });
            // Örnek: Özel mesaj gönderme
            socket.on('private_message', (data) => {
                this.io.to(`user_${data.to}`).emit('private_message', {
                    from: socket.data.user.userId,
                    message: data.message
                });
            });
            // Örnek: Genel mesaj yayınlama
            socket.on('broadcast_message', (message) => {
                this.io.emit('broadcast_message', {
                    from: socket.data.user.userId,
                    message: message
                });
            });
            // Diğer olay dinleyicileri buraya eklenebilir
        });
    }
    getIO() {
        return this.io;
    }
    // Belirli bir kullanıcıya mesaj gönderme metodu
    sendToUser(userId, event, data) {
        this.io.to(`user_${userId}`).emit(event, data);
    }
    // Tüm bağlı kullanıcılara mesaj yayınlama metodu
    broadcastToAll(event, data) {
        this.io.emit(event, data);
    }
}
exports.WebSocketServer = WebSocketServer;
