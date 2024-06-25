import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import { AppDataSource } from "./data-source";
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import campaignRoutes from './routes/campaignRoutes';
import financialDetailsRoutes from './routes/financialDetailsRoutes';
import datesRoutes from './routes/datesRoutes';
import investorStatsRoutes from './routes/investorStatsRoutes';
import shareDetailsRoutes from './routes/shareDetailsRoutes';
import currencyDataRoutes from './routes/currencyDataRoutes';
import companyRoutes from './routes/companyRoutes';
import { specs, swaggerUi } from './swagger';
import debug from 'debug';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/error.middleware';
import passport from './config/passport';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { WebSocketServer } from './websocket/socketServer';

dotenv.config();

const log = debug('app:server');
const dbLog = debug('app:database');

const app = express();

// SSL options
const options = {
  key: fs.readFileSync(path.join(__dirname, '../kifobu.com-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../kifobu.com.pem'))
};

// CSRF koruma middleware'ini ekleyin
const csrfProtection = csrf({ cookie: true });

// Middleware
app.use(cors({
  origin: 'https://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(loggerMiddleware);
app.use(passport.initialize());

// CSRF token rotasını ekleyin
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Diğer rotalarınızda da CSRF koruması kullanmak istiyorsanız:
app.use(csrfProtection);

// Initialize WebSocket
let webSocketServer: WebSocketServer;

// Database connection and server start
AppDataSource.initialize()
  .then(() => {
    dbLog("Data Source has been initialized!");
    const PORT = process.env.PORT || 3000;

    // Create HTTPS server
    const server = https.createServer(options, app);

    // Initialize WebSocket
    webSocketServer = new WebSocketServer(server);

    // Routes
    app.use('/api/users', userRoutes(webSocketServer));
    app.use('/api/auth', authRoutes(webSocketServer));
    app.use('/api/campaigns', campaignRoutes(webSocketServer));
    app.use('/api/companies', companyRoutes(webSocketServer));
    app.use('/api/currency-data', currencyDataRoutes(webSocketServer));
    app.use('/api/dates', datesRoutes(webSocketServer));
    app.use('/api/financial-details', financialDetailsRoutes(webSocketServer));
    app.use('/api/investor-stats', investorStatsRoutes(webSocketServer));
    app.use('/api/share-details', shareDetailsRoutes(webSocketServer));

    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

    app.get('/', (req, res) => {
      res.json({ message: 'KiFoBu Pek Yakında Yeni işe Alımları Duyuracak. Bugsuz günler :)' });
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
      log(`Server is running on https://kifobu.com:${PORT}`);
      log(`Swagger UI is available at https://kifobu.com:${PORT}/api-docs`);
      log('WebSocket server is running');
    });
  })
  .catch((err) => {
    dbLog("Error during Data Source initialization", err);
  });

export { webSocketServer };
