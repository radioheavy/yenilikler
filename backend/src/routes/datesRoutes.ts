import { Router } from 'express';
import { DatesController } from '../controllers/DatesController';
import { WebSocketServer } from '../websocket/socketServer';

export default (webSocketServer: WebSocketServer) => {
  const router = Router();
  const datesController = new DatesController(webSocketServer);

  router.post('/', (req, res) => datesController.createDates(req, res));
  router.get('/:id', (req, res) => datesController.getDates(req, res));
  router.put('/:id', (req, res) => datesController.updateDates(req, res));
  router.delete('/:id', (req, res) => datesController.deleteDates(req, res));
  router.get('/:id/duration', (req, res) => datesController.getCampaignDuration(req, res));

  return router;
};