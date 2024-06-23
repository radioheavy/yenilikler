import { Router } from 'express';
import { FinancialDetailsController } from '../controllers/FinancialDetailsController';
import { WebSocketServer } from '../websocket/socketServer';

export default (webSocketServer: WebSocketServer) => {
  const router = Router();
  const financialDetailsController = new FinancialDetailsController(webSocketServer);

  router.post('/', (req, res) => financialDetailsController.createFinancialDetails(req, res));
  router.get('/:id', (req, res) => financialDetailsController.getFinancialDetails(req, res));
  router.put('/:id', (req, res) => financialDetailsController.updateFinancialDetails(req, res));
  router.delete('/:id', (req, res) => financialDetailsController.deleteFinancialDetails(req, res));
  router.get('/:id/realization-rate', (req, res) => financialDetailsController.getRealizationRate(req, res));
  router.get('/:id/average-investment', (req, res) => financialDetailsController.getAverageInvestmentAmount(req, res));
  router.get('/:id/extra-funding', (req, res) => financialDetailsController.getExtraFundingAmount(req, res));
  router.get('/:id/remaining-funding', (req, res) => financialDetailsController.getRemainingFundingAmount(req, res));
  router.get('/:id/valuation', (req, res) => financialDetailsController.getValuation(req, res));

  return router;
};