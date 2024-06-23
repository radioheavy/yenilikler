import { Router } from 'express';
import { ShareDetailsController } from '../controllers/ShareDetailsController';
import { WebSocketServer } from '../websocket/socketServer';

export default (webSocketServer: WebSocketServer) => {
  const router = Router();
  const shareDetailsController = new ShareDetailsController(webSocketServer);

  router.post('/', (req, res) => shareDetailsController.createShareDetails(req, res));
  router.get('/:id', (req, res) => shareDetailsController.getShareDetails(req, res));
  router.put('/:id', (req, res) => shareDetailsController.updateShareDetails(req, res));
  router.delete('/:id', (req, res) => shareDetailsController.deleteShareDetails(req, res));
  router.get('/:id/price-change', (req, res) => shareDetailsController.getSharePriceChange(req, res));

  return router;
};