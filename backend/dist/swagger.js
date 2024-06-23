"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUi = exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
exports.swaggerUi = swagger_ui_express_1.default;
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Kifobu API',
            version: '1.0.0',
            description: 'API documentation for Kifobu project',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Development server',
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/server.ts'], // Tüm route dosyalarını ve server.ts'yi tarıyor
};
const specs = (0, swagger_jsdoc_1.default)(options);
exports.specs = specs;
