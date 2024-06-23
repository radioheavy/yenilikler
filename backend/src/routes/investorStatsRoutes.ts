import { Router } from 'express';
import { InvestorStatsController } from '../controllers/InvestorStatsController';
import { WebSocketServer } from '../websocket/socketServer';

export default (webSocketServer: WebSocketServer) => {
  const router = Router();
  const investorStatsController = new InvestorStatsController(webSocketServer);

  router.post('/', (req, res) => investorStatsController.createInvestorStats(req, res));
  router.get('/:id', (req, res) => investorStatsController.getInvestorStats(req, res));
  router.put('/:id', (req, res) => investorStatsController.updateInvestorStats(req, res));
  router.delete('/:id', (req, res) => investorStatsController.deleteInvestorStats(req, res));
  router.get('/:id/total', (req, res) => investorStatsController.getTotalInvestors(req, res));
  router.get('/:id/qualified-percentage', (req, res) => investorStatsController.getQualifiedInvestorPercentage(req, res));

  return router;
};