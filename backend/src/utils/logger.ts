import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Log dosyalarının kaydedileceği dizin
const logDir = 'logs';

// Log dizini yoksa oluşturalım
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

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
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

// Transport'ları oluşturalım
const transports = [
  // Konsola loglama
  new winston.transports.Console({
    handleExceptions: true,
  }),
  // Hata logları için ayrı bir dosya
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    handleExceptions: true,
  }),
  // Tüm loglar için genel bir dosya
  new winston.transports.File({
    filename: path.join(logDir, 'all.log'),
    handleExceptions: true,
  }),
  // HTTP logları için ayrı bir dosya
  new winston.transports.File({
    filename: path.join(logDir, 'http.log'),
    level: 'http',
    handleExceptions: true,
  }),
];

// Logger'ı oluşturalım
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'warn'),
  levels,
  format,
  transports,
  exitOnError: false, // handleExceptions ile birlikte kullanılır
});

// HTTP loglamayı middleware olarak kullanmak için bir logger oluşturun
export const httpLogger = winston.createLogger({
  level: 'http',
  levels,
  format,
  transports: [new winston.transports.File({ filename: path.join(logDir, 'http.log') })],
});

export default logger;
