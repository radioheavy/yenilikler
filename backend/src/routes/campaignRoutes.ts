import { Router } from 'express';
import { CampaignController } from '../controllers/CampaignController';
import { WebSocketServer } from '../websocket/socketServer';

export default (webSocketServer: WebSocketServer) => {
  const router = Router();
  const campaignController = new CampaignController(webSocketServer);

  router.post('/', (req, res) => campaignController.createCampaign(req, res));
  router.get('/:id', (req, res) => campaignController.getCampaign(req, res));
  router.put('/:id', (req, res) => campaignController.updateCampaign(req, res));
  router.delete('/:id', (req, res) => campaignController.deleteCampaign(req, res));
  router.get('/', (req, res) => campaignController.getAllCampaigns(req, res));

  return router;
};