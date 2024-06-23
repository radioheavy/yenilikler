import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from "./data-source";
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import { specs, swaggerUi } from './swagger';
import logger from './utils/logger';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/error.middleware';
import passport from './config/passport';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { Server as SocketServer } from 'socket.io';
import { WebSocketServer } from './websocket/socketServer';

dotenv.config();

const app = express();

// SSL options
const options = {
  key: fs.readFileSync(path.join(__dirname, '../kifobu.com-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../kifobu.com.pem'))
};

// Middleware
app.use(cors({
  origin: ['https://localhost:3000', 'https://kifobu.com:3000'],
  credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use(passport.initialize());

// Initialize WebSocket
let webSocketServer: WebSocketServer;

// Database connection and server start
AppDataSource.initialize()
  .then(() => {
    logger.info("Data Source has been initialized!");
    const PORT = process.env.PORT || 3000;

    // Create HTTPS server
    const server = https.createServer(options, app);

    // Initialize WebSocket
    webSocketServer = new WebSocketServer(server);

    // Routes
    app.use('/api/users', userRoutes(webSocketServer));
    app.use('/api/auth', authRoutes(webSocketServer));

    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to Kifobu API' });
    });

    // Test WebSocket endpoint
    app.get('/test-websocket', (req, res) => {
      if (webSocketServer) {
        res.json({ message: 'WebSocket server is running' });
      } else {
        res.status(500).json({ message: 'WebSocket server is not initialized' });
      }
    });

    // Error handling middleware
    app.use(errorHandler);

    server.listen(PORT, () => {
      logger.info(`Server is running on https://kifobu.com:${PORT}`);
      logger.info(`Swagger UI is available at https://kifobu.com:${PORT}/api-docs`);
      logger.info('WebSocket server is running');
    });
  })
  .catch((err) => {
    logger.error("Error during Data Source initialization", err);
  });

export { webSocketServer };
