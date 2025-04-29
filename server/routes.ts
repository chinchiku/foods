import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { FoodItem } from "@/types";

// In-memory storage for food items
let foodItems: FoodItem[] = [];
let nextId = 1;

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/food-items", (req: Request, res: Response) => {
    // クエリパラメータから特定の保管場所が指定されている場合はフィルタリング
    const location = req.query.location as string | undefined;
    
    if (location) {
      const filteredItems = foodItems.filter(item => item.location === location);
      return res.json(filteredItems);
    }
    
    res.json(foodItems);
  });

  app.post("/api/food-items", (req: Request, res: Response) => {
    const { name, expiryDate, location } = req.body;
    
    if (!name || !expiryDate) {
      return res.status(400).json({ message: "Name and expiry date are required" });
    }
    
    const newItem: FoodItem = {
      id: String(nextId++),
      name,
      expiryDate: new Date(expiryDate),
      location
    };
    
    foodItems.push(newItem);
    res.status(201).json(newItem);
  });

  app.put("/api/food-items/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, expiryDate, location } = req.body;
    
    if (!name || !expiryDate) {
      return res.status(400).json({ message: "Name and expiry date are required" });
    }
    
    const itemIndex = foodItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Food item not found" });
    }
    
    const updatedItem: FoodItem = {
      id,
      name,
      expiryDate: new Date(expiryDate),
      location
    };
    
    foodItems[itemIndex] = updatedItem;
    res.json(updatedItem);
  });

  app.delete("/api/food-items/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const itemIndex = foodItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Food item not found" });
    }
    
    foodItems.splice(itemIndex, 1);
    res.status(204).end();
  });

  // 保管場所ごとの食品アイテム数を取得するエンドポイント
  app.get("/api/location-stats", (req: Request, res: Response) => {
    const stats: Record<string, number> = {};
    
    foodItems.forEach(item => {
      const location = item.location || "未分類";
      stats[location] = (stats[location] || 0) + 1;
    });
    
    res.json(stats);
  });

  const httpServer = createServer(app);
  return httpServer;
}
