import { useState } from "react";
import FoodItemForm from "@/components/FoodItemForm";
import FoodItemList from "@/components/FoodItemList";
import StatusLegend from "@/components/StatusLegend";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { useFoodItems } from "@/hooks/useFoodItems";
import { FoodItem } from "@/types";

export default function Home() {
  const {
    foodItems,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
  } = useFoodItems();

  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const handleStartEdit = (item: FoodItem) => {
    setEditingItem(item);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleSubmit = (name: string, expiryDate: Date) => {
    if (editingItem) {
      updateFoodItem({
        ...editingItem,
        name,
        expiryDate,
      });
      setEditingItem(null);
    } else {
      addFoodItem({
        id: Date.now().toString(),
        name,
        expiryDate,
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteItemId) {
      deleteFoodItem(deleteItemId);
      setDeleteItemId(null);
    }
  };

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
      
      <FoodItemList
        foodItems={foodItems}
        onEdit={handleStartEdit}
        onDelete={setDeleteItemId}
      />
      
      {deleteItemId && (
        <DeleteConfirmation
          onCancel={() => setDeleteItemId(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
