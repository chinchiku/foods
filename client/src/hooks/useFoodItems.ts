import { useState, useEffect } from 'react';
import { FoodItem } from '@/types';

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
      setError(null);
    } catch (err) {
      console.error('Error fetching food items:', err);
      setError('食品リストの読み込みに失敗しました');
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
      setFoodItems(prev => [...prev, { 
        id: addedItem.id, 
        name: addedItem.name, 
        expiryDate: addedItem.expiryDate ? new Date(addedItem.expiryDate) : undefined,
        registrationDate: new Date(addedItem.registrationDate),
        locationId: addedItem.locationId,
        hasNoExpiry: addedItem.hasNoExpiry
      }]);
    } catch (err) {
      console.error('Error adding food item:', err);
      setError('食品の登録に失敗しました');
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
      setFoodItems(prev => 
        prev.map(item => 
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
        )
      );
    } catch (err) {
      console.error('Error updating food item:', err);
      setError('食品の更新に失敗しました');
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
      
      setFoodItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting food item:', err);
      setError('食品の削除に失敗しました');
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