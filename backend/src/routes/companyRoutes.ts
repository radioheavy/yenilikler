import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';
import { WebSocketServer } from '../websocket/socketServer';

export default (webSocketServer: WebSocketServer) => {
  const router = Router();
  const companyController = new CompanyController(webSocketServer);

  router.post('/', (req, res) => companyController.createCompany(req, res));
  router.get('/:id', (req, res) => companyController.getCompany(req, res));
  router.put('/:id', (req, res) => companyController.updateCompany(req, res));
  router.delete('/:id', (req, res) => companyController.deleteCompany(req, res));
  router.get('/', (req, res) => companyController.getAllCompanies(req, res));
  router.get('/:id/social-media', (req, res) =>
    companyController.getCompanySocialMediaLinks(req, res),
  );

  return router;
};
