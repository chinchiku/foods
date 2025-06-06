import { useState, useEffect } from 'react';
import { FoodItem } from '@/types';

// ローカルストレージキー
const FOOD_ITEMS_STORAGE_KEY = 'food-expiry-app-items';

// APIから返ってくる食品アイテムの型定義
interface ApiResponse {
  id: string;
  name: string;
  expiryDate?: string;
  registrationDate: string;
  locationId?: string;
  hasNoExpiry?: boolean;
}

export function useFoodItems() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ローカルストレージからデータをロード
  const loadFromLocalStorage = (): FoodItem[] => {
    try {
      const stored = localStorage.getItem(FOOD_ITEMS_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored);
        // 日付の復元
        return items.map((item: any) => ({
          ...item,
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
          registrationDate: new Date(item.registrationDate)
        }));
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    return [];
  };

  // ローカルストレージにデータを保存
  const saveToLocalStorage = (items: FoodItem[]) => {
    try {
      localStorage.setItem(FOOD_ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  // Fetch food items
  const fetchFoodItems = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/food-items');
      if (!response.ok) {
        throw new Error('Failed to fetch food items');
      }
      const items: ApiResponse[] = await response.json();
      
      // Convert string dates to Date objects
      const formattedItems: FoodItem[] = items.map(item => ({
        ...item,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        registrationDate: new Date(item.registrationDate)
      }));
      
      setFoodItems(formattedItems);
      // オンラインでロードに成功したらローカルストレージに保存
      saveToLocalStorage(formattedItems);
      setError(null);
    } catch (err) {
      console.error('Error fetching food items:', err);
      setError('食品リストの読み込みに失敗しました');
      
      // APIからロードに失敗した場合、ローカルストレージからロード
      const storedItems = loadFromLocalStorage();
      if (storedItems.length > 0) {
        setFoodItems(storedItems);
        setError('オフラインモードです。ローカルに保存されたデータを表示しています。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new food item
  const addFoodItem = async (newItem: FoodItem) => {
    try {
      const response = await fetch('/api/food-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add food item');
      }
      
      const addedItem: ApiResponse = await response.json();
      const updatedItem = { 
        id: addedItem.id, 
        name: addedItem.name, 
        expiryDate: addedItem.expiryDate ? new Date(addedItem.expiryDate) : undefined,
        registrationDate: new Date(addedItem.registrationDate),
        locationId: addedItem.locationId,
        hasNoExpiry: addedItem.hasNoExpiry
      };
      
      const updatedItems = [...foodItems, updatedItem];
      setFoodItems(updatedItems);
      // データが変更されたらローカルストレージも更新
      saveToLocalStorage(updatedItems);
    } catch (err) {
      console.error('Error adding food item:', err);
      // オフラインの場合でも、ローカルにデータを追加
      if (!navigator.onLine) {
        const newId = Date.now().toString();
        const offlineItem = {
          ...newItem,
          id: newId,
          _offline: true // オフライン作成のマーク
        };
        const updatedItems = [...foodItems, offlineItem];
        setFoodItems(updatedItems);
        saveToLocalStorage(updatedItems);
        setError('オフラインモードです。再接続時にサーバーと同期します。');
      } else {
        setError('食品の登録に失敗しました');
      }
    }
  };

  // Update an existing food item
  const updateFoodItem = async (updatedItem: FoodItem) => {
    try {
      const response = await fetch(`/api/food-items/${updatedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update food item');
      }
      
      const result: ApiResponse = await response.json();
      const updatedItems = foodItems.map(item => 
        item.id === updatedItem.id 
          ? { 
              id: result.id, 
              name: result.name, 
              expiryDate: result.expiryDate ? new Date(result.expiryDate) : undefined,
              registrationDate: new Date(result.registrationDate),
              locationId: result.locationId,
              hasNoExpiry: result.hasNoExpiry
            } 
          : item
      );
      
      setFoodItems(updatedItems);
      // データが変更されたらローカルストレージも更新
      saveToLocalStorage(updatedItems);
    } catch (err) {
      console.error('Error updating food item:', err);
      
      // オフラインの場合でも、ローカルでデータを更新
      if (!navigator.onLine) {
        const updatedItems = foodItems.map(item => 
          item.id === updatedItem.id ? { ...updatedItem, _offlineUpdated: true } : item
        );
        setFoodItems(updatedItems);
        saveToLocalStorage(updatedItems);
        setError('オフラインモードです。再接続時にサーバーと同期します。');
      } else {
        setError('食品の更新に失敗しました');
      }
    }
  };

  // Delete a food item
  const deleteFoodItem = async (id: string) => {
    try {
      const response = await fetch(`/api/food-items/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete food item');
      }
      
      const updatedItems = foodItems.filter(item => item.id !== id);
      setFoodItems(updatedItems);
      // データが変更されたらローカルストレージも更新
      saveToLocalStorage(updatedItems);
    } catch (err) {
      console.error('Error deleting food item:', err);
      
      // オフラインの場合でも、ローカルでデータを削除
      if (!navigator.onLine) {
        // 完全に削除するか、削除マークをつけるか
        // (本実装ではオフラインでの削除を直接行う)
        const updatedItems = foodItems.filter(item => item.id !== id);
        setFoodItems(updatedItems);
        saveToLocalStorage(updatedItems);
        setError('オフラインモードです。再接続時にサーバーと同期します。');
      } else {
        setError('食品の削除に失敗しました');
      }
    }
  };

  // Fetch items on initial load
  useEffect(() => {
    fetchFoodItems();
  }, []);

  return {
    foodItems,
    isLoading,
    error,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
    refreshFoodItems: fetchFoodItems
  };
}