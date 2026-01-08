import { Router } from "express";
import { getDashboardStats } from "./statistics.controller.js";

const statisticsRouter = Router();

statisticsRouter.get("/", getDashboardStats);

export default statisticsRouter;
