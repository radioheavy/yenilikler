"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
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
winston_1.default.addColors(colors);
// Log formatını oluşturalım
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Transport'ları oluşturalım
const transports = [
    // Konsola loglama
    new winston_1.default.transports.Console(),
    // Hata logları için ayrı bir dosya
    new winston_1.default.transports.File({
        filename: path_1.default.join(logDir, 'error.log'),
        level: 'error',
    }),
    // Tüm loglar için genel bir dosya
    new winston_1.default.transports.File({ filename: path_1.default.join(logDir, 'all.log') }),
];
// Logger'ı oluşturalım
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
    levels,
    format,
    transports,
});
exports.default = logger;
