import { Router } from 'express';
import { CurrencyDataController } from '../controllers/CurrencyDataController';
import { WebSocketServer } from '../websocket/socketServer';

export default (webSocketServer: WebSocketServer) => {
  const router = Router();
  const currencyDataController = new CurrencyDataController(webSocketServer);

  router.post('/', (req, res) => currencyDataController.createCurrencyData(req, res));
  router.get('/:id', (req, res) => currencyDataController.getCurrencyData(req, res));
  router.put('/:id', (req, res) => currencyDataController.updateCurrencyData(req, res));
  router.delete('/:id', (req, res) => currencyDataController.deleteCurrencyData(req, res));
  router.get('/:id/inflation-adjusted', (req, res) => currencyDataController.getInflationAdjustedValues(req, res));
  router.get('/:id/change-rates', (req, res) => currencyDataController.getCurrencyChangeRates(req, res));

  return router;
};