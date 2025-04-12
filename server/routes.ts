import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRouter = express.Router();
  app.use('/api', apiRouter);
  
  // Get game status
  apiRouter.get('/status', (req: Request, res: Response) => {
    res.json({ status: 'ok', version: '1.0.0' });
  });
  
  // Leaderboard placeholder
  apiRouter.get('/leaderboard', (req: Request, res: Response) => {
    res.json({ message: 'Leaderboard feature coming soon!' });
  });
  
  // Error handling for API routes
  apiRouter.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  const httpServer = createServer(app);

  return httpServer;
}
