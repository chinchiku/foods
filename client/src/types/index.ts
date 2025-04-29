export interface FoodItem {
  id: string;
  name: string;
  expiryDate: Date;
  locationId?: string; // 保管場所ID
}

export interface StorageLocation {
  id: string;
  name: string;
}
