import winston from 'winston';
import path from 'path';

// Log dosyalarının kaydedileceği dizin
const logDir = 'logs';

// Log seviyelerini tanımlayalım
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Log renklerini tanımlayalım
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Winston'a renkleri tanıtalım
winston.addColors(colors);

// Log formatını oluşturalım
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Transport'ları oluşturalım
const transports = [
  // Konsola loglama
  new winston.transports.Console(),
  // Hata logları için ayrı bir dosya
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
  }),
  // Tüm loglar için genel bir dosya
  new winston.transports.File({ filename: path.join(logDir, 'all.log') }),
];

// Logger'ı oluşturalım
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  levels,
  format,
  transports,
});

export default logger;