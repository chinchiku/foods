import { useState } from "react";
import { useFoodItems } from "@/hooks/useFoodItems";
import { useStorageLocations } from "@/hooks/useStorageLocations";
import { FoodItem, StorageLocation } from "@/types";
import { Home as HomeIcon, ListChecks } from "lucide-react";
import { useLocation, Link, Route } from "wouter";
import RegisterPage from "./RegisterPage";
import ListPage from "./ListPage";
import { Button } from "@/components/ui/button";

export default function Home() {
  const {
    foodItems,
    isLoading: foodLoading,
    error: foodError,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
  } = useFoodItems();

  const [location] = useLocation();
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const handleStartEdit = (item: FoodItem) => {
    setEditingItem(item);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleSubmit = (name: string, expiryDate: Date | undefined, locationId: string, hasNoExpiry: boolean, registrationDate: Date) => {
    if (editingItem) {
      updateFoodItem({
        ...editingItem,
        name,
        expiryDate,
        locationId,
        hasNoExpiry,
        registrationDate
      });
      setEditingItem(null);
    } else {
      addFoodItem({
        id: Date.now().toString(),
        name,
        expiryDate,
        locationId,
        hasNoExpiry,
        registrationDate
      });
    }
  };

  const handleDeleteConfirm = (id: string) => {
    deleteFoodItem(id);
  };

  // ページのレンダリング内容を決定する
  const renderContent = () => {
    if (location === "/" || location === "/register") {
      return (
        <RegisterPage 
          editingItem={editingItem} 
          onSubmit={handleSubmit} 
          onCancelEdit={handleCancelEdit} 
        />
      );
    } else if (location === "/list") {
      return (
        <ListPage 
          onEdit={handleStartEdit}
          onDeleteConfirm={handleDeleteConfirm}
        />
      );
    } 
    // デフォルトでリストページを表示
    return (
      <RegisterPage 
        editingItem={editingItem} 
        onSubmit={handleSubmit} 
        onCancelEdit={handleCancelEdit} 
      />
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-20">
      <header className="mb-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
        <h1 className="font-bold text-center mt-2 mb-4">
          食品期限管理アプリ
        </h1>
        
        <div className="flex justify-center gap-1 mt-4 mb-2">
          <Link href="/" className={`flex-1 flex items-center justify-center gap-1 p-3 rounded-l-md transition-all duration-200 ${location === '/' || location === '/register' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <HomeIcon className="h-4 w-4" />
            <span>登録</span>
          </Link>
          <Link href="/list" className={`flex-1 flex items-center justify-center gap-1 p-3 rounded-r-md transition-all duration-200 ${location === '/list' ? 'bg-primary text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <ListChecks className="h-4 w-4" />
            <span>一覧</span>
          </Link>
        </div>
      </header>
      
      <main className="content-bg p-4">
        {renderContent()}
      </main>
    </div>
  );
}
