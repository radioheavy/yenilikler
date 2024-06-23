"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webSocketServer = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const data_source_1 = require("./data-source");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const swagger_1 = require("./swagger");
const debug_1 = __importDefault(require("debug"));
const logger_middleware_1 = require("./middlewares/logger.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const passport_1 = __importDefault(require("./config/passport"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const socketServer_1 = require("./websocket/socketServer");
dotenv_1.default.config();
const log = (0, debug_1.default)('app:server');
const dbLog = (0, debug_1.default)('app:database');
const app = (0, express_1.default)();
// SSL options
const options = {
    key: fs_1.default.readFileSync(path_1.default.join(__dirname, '../kifobu.com-key.pem')),
    cert: fs_1.default.readFileSync(path_1.default.join(__dirname, '../kifobu.com.pem'))
};
// Middleware
app.use((0, cors_1.default)({
    origin: ['https://localhost:3000', 'https://kifobu.com:3000'],
    credentials: true
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(logger_middleware_1.loggerMiddleware);
app.use(passport_1.default.initialize());
// Initialize WebSocket
let webSocketServer;
// Database connection and server start
data_source_1.AppDataSource.initialize()
    .then(() => {
    dbLog("Data Source has been initialized!");
    const PORT = process.env.PORT || 3000;
    // Create HTTPS server
    const server = https_1.default.createServer(options, app);
    // Initialize WebSocket
    exports.webSocketServer = webSocketServer = new socketServer_1.WebSocketServer(server);
    // Routes
    app.use('/api/users', (0, userRoutes_1.default)(webSocketServer));
    app.use('/api/auth', (0, authRoutes_1.default)(webSocketServer));
    // Swagger UI
    app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs));
    app.get('/', (req, res) => {
        res.json({ message: 'Welcome to Kifobu API' });
    });
    // Test WebSocket endpoint
    app.get('/test-websocket', (req, res) => {
        if (webSocketServer) {
            res.json({ message: 'WebSocket server is running' });
        }
        else {
            res.status(500).json({ message: 'WebSocket server is not initialized' });
        }
    });
    // Error handling middleware
    app.use(error_middleware_1.errorHandler);
    server.listen(PORT, () => {
        log(`Server is running on https://kifobu.com:${PORT}`);
        log(`Swagger UI is available at https://kifobu.com:${PORT}/api-docs`);
        log('WebSocket server is running');
    });
})
    .catch((err) => {
    dbLog("Error during Data Source initialization", err);
});
