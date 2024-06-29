import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import http from 'http';
import { AppDataSource } from './data-source';
import routes from './routes/index';
import { specs, swaggerUi } from './swagger';
import debug from 'debug';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { errorHandler } from './middlewares/error.middleware';
import passport from './config/passport';
import { WebSocketServer } from './websocket/socketServer';

dotenv.config();

const log = debug('app:server');
const dbLog = debug('app:database');

const app = express();

// CSRF koruma middleware'ini ekleyin
const csrfProtection = csrf({ cookie: true });

// Helmet CSP ayarları
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'sha256-abc123'", 'blob:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  }),
);
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
    dbLog('Data Source has been initialized!');
    const PORT = process.env.PORT || 3000;

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket
    webSocketServer = new WebSocketServer(server);

    // Routes
    app.use('/api', routes(webSocketServer));

    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

    app.get('/', (req, res) => {
      res.json({
        message:
          "KiFoBu'dan Müthiş Haberler! Yeni işe alımlar yakında başlıyor. Ekibimize katıl ve birlikte geleceği inşa edelim. Bir yandan da bugları kovalayalım, eğlenceli günler bizi bekliyor! :)",
      });
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
      log(`Server is running on http://localhost:${PORT}`);
      log(`Swagger UI is available at http://localhost:${PORT}/api-docs`);
      log('WebSocket server is running');
    });
  })
  .catch((err) => {
    dbLog('Error during Data Source initialization', err);
  });

export { webSocketServer };
