export interface FoodItem {
  id: string;
  name: string;
  expiryDate: Date;
  location?: string; // 保管場所
}

// 保管場所のリスト
export const storageLocations = [
  "冷蔵庫",
  "冷凍庫",
  "パントリー",
  "食器棚",
  "その他"
];
