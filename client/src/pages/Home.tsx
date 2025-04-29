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
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-center text-slate-800 mt-4">
          食品期限管理
        </h1>
        
        <div className="flex justify-center gap-1 mt-6 mb-8">
          <Link href="/" className={`flex-1 flex items-center justify-center gap-1 p-3 rounded-l-md ${location === '/' || location === '/register' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <HomeIcon className="h-4 w-4" />
            <span>登録</span>
          </Link>
          <Link href="/list" className={`flex-1 flex items-center justify-center gap-1 p-3 rounded-r-md ${location === '/list' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <ListChecks className="h-4 w-4" />
            <span>一覧</span>
          </Link>
        </div>
      </header>
      
      <main>
        {renderContent()}
      </main>
    </div>
  );
}
