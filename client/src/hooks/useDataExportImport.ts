import { useState } from 'react';
import { useFoodItems } from './useFoodItems';
import { useStorageLocations } from './useStorageLocations';

export function useDataExportImport() {
  const { refreshFoodItems } = useFoodItems();
  const { refreshLocations } = useStorageLocations();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data export function
  const exportData = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const response = await fetch('/api/export');
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      const data = await response.json();
      
      // Create blob and download
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link and click it
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      link.download = `food-expiry-data-${timestamp}.json`;
      link.href = url;
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('データのエクスポートに失敗しました');
      return false;
    } finally {
      setIsExporting(false);
    }
  };
  
  // Data import function
  const importData = async (file: File) => {
    setIsImporting(true);
    setError(null);
    
    try {
      // Read file
      const fileContent = await readFileAsText(file);
      let data;
      
      try {
        data = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error('Invalid JSON format');
      }
      
      // Validate data structure
      if (!data.foodItems || !data.storageLocations || 
          !Array.isArray(data.foodItems) || !Array.isArray(data.storageLocations)) {
        throw new Error('Invalid data format');
      }
      
      // Send to server
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Import failed');
      }
      
      // Refresh data
      await Promise.all([
        refreshFoodItems(),
        refreshLocations()
      ]);
      
      return true;
    } catch (err) {
      console.error('Error importing data:', err);
      setError(err instanceof Error ? err.message : 'データのインポートに失敗しました');
      return false;
    } finally {
      setIsImporting(false);
    }
  };
  
  // Helper function to read file content
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };
  
  return {
    exportData,
    importData,
    isExporting,
    isImporting,
    error
  };
}