import { useState } from "react";
import FoodItemForm from "@/components/FoodItemForm";
import FoodItemList from "@/components/FoodItemList";
import StatusLegend from "@/components/StatusLegend";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { useFoodItems } from "@/hooks/useFoodItems";
import { FoodItem, storageLocations } from "@/types";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const {
    foodItems,
    isLoading,
    error,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
  } = useFoodItems();

  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const handleStartEdit = (item: FoodItem) => {
    setEditingItem(item);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleSubmit = (name: string, expiryDate: Date, location: string) => {
    if (editingItem) {
      updateFoodItem({
        ...editingItem,
        name,
        expiryDate,
        location,
      });
      setEditingItem(null);
    } else {
      addFoodItem({
        id: Date.now().toString(),
        name,
        expiryDate,
        location,
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteItemId) {
      deleteFoodItem(deleteItemId);
      setDeleteItemId(null);
    }
  };

  // 保管場所でフィルタリングされた食品リスト
  const filteredFoodItems = selectedLocation
    ? foodItems.filter(item => item.location === selectedLocation)
    : foodItems;

  return (
    <div className="max-w-md mx-auto p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-center text-slate-800 mt-4 mb-6">
          食品期限管理
        </h1>
        
        <FoodItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={handleCancelEdit}
        />
      </header>
      
      <StatusLegend />
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">登録済み食品一覧</h2>
        
        <Tabs defaultValue="all" onValueChange={(value) => setSelectedLocation(value === "all" ? null : value)}>
          <TabsList className="w-full flex overflow-x-auto mb-4">
            <TabsTrigger value="all" className="flex-1">すべて</TabsTrigger>
            {storageLocations.map(location => (
              <TabsTrigger key={location} value={location} className="flex-1">
                {location}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : (
              <FoodItemList
                foodItems={foodItems}
                onEdit={handleStartEdit}
                onDelete={setDeleteItemId}
              />
            )}
          </TabsContent>
          
          {storageLocations.map(location => (
            <TabsContent key={location} value={location}>
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-4">{error}</div>
              ) : (
                <FoodItemList
                  foodItems={foodItems.filter(item => item.location === location)}
                  onEdit={handleStartEdit}
                  onDelete={setDeleteItemId}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {deleteItemId && (
        <DeleteConfirmation
          onCancel={() => setDeleteItemId(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
