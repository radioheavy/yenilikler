import { Router } from "express";
import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import campaignRoutes from "./campaignRoutes";
import financialDetailsRoutes from "./financialDetailsRoutes";
import datesRoutes from "./datesRoutes";
import investorStatsRoutes from "./investorStatsRoutes";
import shareDetailsRoutes from "./shareDetailsRoutes";
import currencyDataRoutes from "./currencyDataRoutes";
import companyRoutes from "./companyRoutes";
import ipRoutes from "./ipRoutes";
import { WebSocketServer } from "../websocket/socketServer";

const routes = (webSocketServer: WebSocketServer) => {
  const router = Router();

  router.use("/users", userRoutes(webSocketServer));
  router.use("/auth", authRoutes(webSocketServer));
  router.use("/campaigns", campaignRoutes(webSocketServer));
  router.use("/companies", companyRoutes(webSocketServer));
  router.use("/currency-data", currencyDataRoutes(webSocketServer));
  router.use("/dates", datesRoutes(webSocketServer));
  router.use("/financial-details", financialDetailsRoutes(webSocketServer));
  router.use("/investor-stats", investorStatsRoutes(webSocketServer));
  router.use("/share-details", shareDetailsRoutes(webSocketServer));
  router.use("/ip", ipRoutes);

  return router;
};

export default routes;
