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

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     tags: [Root]
 *     responses:
 *       200:
 *         description: Welcome to Kifobu API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Kifobu API' });
});

// Error handling middleware
app.use(errorHandler);

// Database connection and server start
AppDataSource.initialize()
  .then(() => {
    logger.info("Data Source has been initialized!");
    const PORT = process.env.PORT || 3000;
    
    // Create HTTPS server
    https.createServer(options, app).listen(PORT, () => {
      logger.info(`Server is running on https://kifobu.com:${PORT}`);
      logger.info(`Swagger UI is available at https://kifobu.com:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    logger.error("Error during Data Source initialization", err);
  });

export default app;