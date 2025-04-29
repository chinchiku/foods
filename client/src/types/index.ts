export interface FoodItem {
  id: string;
  name: string;
  expiryDate?: Date;    // 期限日（任意）
  registrationDate: Date; // 登録日
  locationId?: string;  // 保管場所ID
  hasNoExpiry?: boolean; // 期限なしフラグ
}

export interface StorageLocation {
  id: string;
  name: string;
}
