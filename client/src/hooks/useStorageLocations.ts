import { useState, useEffect } from 'react';
import { StorageLocation } from '@/types';

// ローカルストレージキー
const STORAGE_LOCATIONS_KEY = 'food-expiry-app-locations';

export function useStorageLocations() {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ローカルストレージからデータをロード
  const loadFromLocalStorage = (): StorageLocation[] => {
    try {
      const stored = localStorage.getItem(STORAGE_LOCATIONS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading locations from localStorage:', e);
    }
    return [];
  };

  // ローカルストレージにデータを保存
  const saveToLocalStorage = (items: StorageLocation[]) => {
    try {
      localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving locations to localStorage:', e);
    }
  };

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
      // オンラインでロードに成功したらローカルストレージに保存
      saveToLocalStorage(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching storage locations:', err);
      setError('保管場所の読み込みに失敗しました');
      
      // APIからロードに失敗した場合、ローカルストレージからロード
      const storedLocations = loadFromLocalStorage();
      if (storedLocations.length > 0) {
        setLocations(storedLocations);
        setError('オフラインモードです。ローカルに保存されたデータを表示しています。');
      }
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
      const updatedLocations = [...locations, newLocation];
      setLocations(updatedLocations);
      // ローカルストレージにも保存
      saveToLocalStorage(updatedLocations);
      return newLocation;
    } catch (err) {
      console.error('Error adding storage location:', err);
      
      // オフラインの場合でも、ローカルにデータを追加
      if (!navigator.onLine) {
        const newId = `offline_${Date.now()}`;
        const offlineLocation = {
          id: newId,
          name,
          _offline: true // オフライン作成のマーク
        };
        const updatedLocations = [...locations, offlineLocation];
        setLocations(updatedLocations);
        saveToLocalStorage(updatedLocations);
        setError('オフラインモードです。再接続時にサーバーと同期します。');
        return offlineLocation;
      } else {
        setError('保管場所の追加に失敗しました');
        return null;
      }
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
      const updatedLocations = locations.map(loc => 
        loc.id === id ? updatedLocation : loc
      );
      
      setLocations(updatedLocations);
      // ローカルストレージにも保存
      saveToLocalStorage(updatedLocations);
      return true;
    } catch (err) {
      console.error('Error updating storage location:', err);
      
      // オフラインの場合でも、ローカルでデータを更新
      if (!navigator.onLine) {
        const updatedLocations = locations.map(loc => 
          loc.id === id ? { id, name, _offlineUpdated: true } : loc
        );
        setLocations(updatedLocations);
        saveToLocalStorage(updatedLocations);
        setError('オフラインモードです。再接続時にサーバーと同期します。');
        return true;
      } else {
        setError('保管場所の更新に失敗しました');
        return false;
      }
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
      const updatedLocations = locations.filter(loc => loc.id !== id);
      setLocations(updatedLocations);
      // ローカルストレージも更新
      saveToLocalStorage(updatedLocations);
      setError(null);
      return true;
    } catch (err) {
      // オフラインの場合でも、ローカルでデータを削除（強制削除の場合のみ）
      if (!navigator.onLine && forceDelete) {
        const updatedLocations = locations.filter(loc => loc.id !== id);
        setLocations(updatedLocations);
        saveToLocalStorage(updatedLocations);
        setError('オフラインモードです。再接続時にサーバーと同期します。');
        return true;
      }
      
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