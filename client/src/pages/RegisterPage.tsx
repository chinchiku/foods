import { useEffect } from "react";
import FoodItemForm from "@/components/FoodItemForm";
import { FoodItem } from "@/types";
import { useLocation } from "wouter";

interface RegisterPageProps {
  editingItem: FoodItem | null;
  onSubmit: (name: string, expiryDate: Date | undefined, locationId: string, hasNoExpiry: boolean, registrationDate: Date) => void;
  onCancelEdit: () => void;
}

export default function RegisterPage({
  editingItem,
  onSubmit,
  onCancelEdit
}: RegisterPageProps) {
  const [location, setLocation] = useLocation();
  
  // 編集モード時はこのページに移動
  useEffect(() => {
    if (editingItem) {
      setLocation("/register");
    }
  }, [editingItem, setLocation]);
  
  return (
    <div className="max-w-md mx-auto p-4 pb-20">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">食品登録</h2>
        
        <div className="flex justify-center mb-6">
          <img 
            src="/src/assets/veggies.svg" 
            alt="食材イラスト" 
            className="w-full max-w-sm opacity-90" 
          />
        </div>
        
        <FoodItemForm
          onSubmit={onSubmit}
          editingItem={editingItem}
          onCancelEdit={onCancelEdit}
        />
      </div>
    </div>
  );
}