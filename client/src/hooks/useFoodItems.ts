import { useState, useEffect } from 'react';
import { FoodItem } from '@/types';
import { apiRequest } from '@/lib/queryClient';

export function useFoodItems() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch food items
  const fetchFoodItems = async () => {
    setIsLoading(true);
    try {
      const items = await apiRequest<FoodItem[]>({
        url: '/api/food-items',
        method: 'GET',
      });
      
      // Convert string dates to Date objects
      const formattedItems = items.map(item => ({
        ...item,
        expiryDate: new Date(item.expiryDate)
      }));
      
      setFoodItems(formattedItems);
      setError(null);
    } catch (err) {
      setError('Failed to load food items');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new food item
  const addFoodItem = async (name: string, expiryDate: Date) => {
    try {
      const newItem = await apiRequest<FoodItem>({
        url: '/api/food-items',
        method: 'POST',
        data: { name, expiryDate }
      });
      
      setFoodItems(prev => [...prev, { ...newItem, expiryDate: new Date(newItem.expiryDate) }]);
      return true;
    } catch (err) {
      setError('Failed to add food item');
      console.error(err);
      return false;
    }
  };

  // Update an existing food item
  const updateFoodItem = async (id: string, name: string, expiryDate: Date) => {
    try {
      const updatedItem = await apiRequest<FoodItem>({
        url: `/api/food-items/${id}`,
        method: 'PUT',
        data: { name, expiryDate }
      });
      
      setFoodItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...updatedItem, expiryDate: new Date(updatedItem.expiryDate) } 
            : item
        )
      );
      return true;
    } catch (err) {
      setError('Failed to update food item');
      console.error(err);
      return false;
    }
  };

  // Delete a food item
  const deleteFoodItem = async (id: string) => {
    try {
      await apiRequest({
        url: `/api/food-items/${id}`,
        method: 'DELETE'
      });
      
      setFoodItems(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      setError('Failed to delete food item');
      console.error(err);
      return false;
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