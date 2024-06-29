import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
