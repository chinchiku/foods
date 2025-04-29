import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import { FoodItem } from "@/types";

// In-memory storage for food items
let foodItems: FoodItem[] = [];
let nextId = 1;

// 保管場所のデータ
interface StorageLocation {
  id: string;
  name: string;
}

// デフォルトの保管場所
let storageLocations: StorageLocation[] = [
  { id: "1", name: "冷蔵庫" },
  { id: "2", name: "冷凍庫" },
  { id: "3", name: "パントリー" },
  { id: "4", name: "食器棚" },
  { id: "5", name: "その他" }
];

let locationNextId = 6;

export async function registerRoutes(app: Express): Promise<Server> {
  // 食品アイテムのAPI routes
  app.get("/api/food-items", (req: Request, res: Response) => {
    // クエリパラメータから特定の保管場所が指定されている場合はフィルタリング
    const locationId = req.query.locationId as string | undefined;
    
    if (locationId) {
      const filteredItems = foodItems.filter(item => item.locationId === locationId);
      return res.json(filteredItems);
    }
    
    res.json(foodItems);
  });

  app.post("/api/food-items", (req: Request, res: Response) => {
    const { name, expiryDate, locationId } = req.body;
    
    if (!name || !expiryDate) {
      return res.status(400).json({ message: "Name and expiry date are required" });
    }
    
    const newItem: FoodItem = {
      id: String(nextId++),
      name,
      expiryDate: new Date(expiryDate),
      locationId
    };
    
    foodItems.push(newItem);
    res.status(201).json(newItem);
  });

  app.put("/api/food-items/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, expiryDate, locationId } = req.body;
    
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
      locationId
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

  // 保管場所のAPI routes
  app.get("/api/storage-locations", (_req: Request, res: Response) => {
    res.json(storageLocations);
  });

  app.post("/api/storage-locations", (req: Request, res: Response) => {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Location name is required" });
    }
    
    const newLocation: StorageLocation = {
      id: String(locationNextId++),
      name
    };
    
    storageLocations.push(newLocation);
    res.status(201).json(newLocation);
  });

  app.put("/api/storage-locations/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Location name is required" });
    }
    
    const locationIndex = storageLocations.findIndex(loc => loc.id === id);
    
    if (locationIndex === -1) {
      return res.status(404).json({ message: "Storage location not found" });
    }
    
    const updatedLocation: StorageLocation = {
      id,
      name
    };
    
    storageLocations[locationIndex] = updatedLocation;
    res.json(updatedLocation);
  });

  app.delete("/api/storage-locations/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const { forceDelete } = req.query;
    
    // 保管場所が使用されているかチェック
    const isLocationInUse = foodItems.some(item => item.locationId === id);
    
    // もし使用中で、forceDeleteフラグが設定されていなければエラーを返す
    if (isLocationInUse && forceDelete !== 'true') {
      return res.status(400).json({ 
        message: "この保管場所は現在使用中です。それでも削除しますか？", 
        itemsCount: foodItems.filter(item => item.locationId === id).length 
      });
    }
    
    const locationIndex = storageLocations.findIndex(loc => loc.id === id);
    
    if (locationIndex === -1) {
      return res.status(404).json({ message: "Storage location not found" });
    }
    
    // 強制削除の場合、関連する食品アイテムの保管場所をnullに設定
    if (isLocationInUse && forceDelete === 'true') {
      foodItems.forEach(item => {
        if (item.locationId === id) {
          item.locationId = undefined;
        }
      });
    }
    
    storageLocations.splice(locationIndex, 1);
    res.status(204).end();
  });

  // 保管場所ごとの食品アイテム数を取得するエンドポイント
  app.get("/api/location-stats", (req: Request, res: Response) => {
    const stats: Record<string, number> = {};
    
    foodItems.forEach(item => {
      const locationId = item.locationId || "未分類";
      stats[locationId] = (stats[locationId] || 0) + 1;
    });
    
    res.json(stats);
  });

  const httpServer = createServer(app);
  return httpServer;
}
