import { useState, useEffect } from 'react';
import { StorageLocation } from '@/types';

export function useStorageLocations() {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 保管場所一覧を取得
  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/storage-locations');
      if (!response.ok) {
        throw new Error('Failed to fetch storage locations');
      }
      const data: StorageLocation[] = await response.json();
      setLocations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching storage locations:', err);
      setError('保管場所の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 新しい保管場所を追加
  const addLocation = async (name: string) => {
    try {
      const response = await fetch('/api/storage-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add storage location');
      }
      
      const newLocation: StorageLocation = await response.json();
      setLocations(prev => [...prev, newLocation]);
      return newLocation;
    } catch (err) {
      console.error('Error adding storage location:', err);
      setError('保管場所の追加に失敗しました');
      return null;
    }
  };

  // 保管場所を更新
  const updateLocation = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/storage-locations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update storage location');
      }
      
      const updatedLocation: StorageLocation = await response.json();
      setLocations(prev => 
        prev.map(loc => loc.id === id ? updatedLocation : loc)
      );
      return true;
    } catch (err) {
      console.error('Error updating storage location:', err);
      setError('保管場所の更新に失敗しました');
      return false;
    }
  };

  // 保管場所を削除
  const deleteLocation = async (id: string, forceDelete: boolean = false) => {
    try {
      const url = forceDelete 
        ? `/api/storage-locations/${id}?forceDelete=true`
        : `/api/storage-locations/${id}`;
        
      const response = await fetch(url, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        if (response.status === 400) {
          const error = await response.json();
          setError(error.message);
          // APIからのレスポンスをそのままエラーとして投げる
          const customError: any = new Error(error.message);
          customError.response = response;
          throw customError;
        }
        throw new Error('Failed to delete storage location');
      }
      
      // 削除成功したら一覧から削除
      setLocations(prev => prev.filter(loc => loc.id !== id));
      setError(null);
      return true;
    } catch (err) {
      // エラーはキャッチして上位に伝播
      console.error('Error deleting storage location:', err);
      if ((err as any).response) {
        // レスポンスを持つカスタムエラーはそのまま上位に投げる
        throw err;
      }
      setError('保管場所の削除に失敗しました');
      throw err;
    }
  };

  // 初期読み込み
  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    isLoading,
    error,
    addLocation,
    updateLocation,
    deleteLocation,
    refreshLocations: fetchLocations
  };
}