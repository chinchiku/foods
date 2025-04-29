import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FoodItem } from "@/types";

interface FoodItemFormProps {
  onSubmit: (name: string, expiryDate: Date) => void;
  editingItem: FoodItem | null;
  onCancelEdit: () => void;
}

export default function FoodItemForm({ 
  onSubmit, 
  editingItem, 
  onCancelEdit 
}: FoodItemFormProps) {
  const [name, setName] = useState("");
  const [expiryDateString, setExpiryDateString] = useState("");

  // Set today's date as default when the component mounts
  useEffect(() => {
    if (!expiryDateString) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setExpiryDateString(`${yyyy}-${mm}-${dd}`);
    }
  }, [expiryDateString]);

  // When an item is set for editing, populate the form
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setExpiryDateString(editingItem.expiryDate.toISOString().split("T")[0]);
    }
  }, [editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !expiryDateString) {
      alert("食品名と期限日を入力してください。");
      return;
    }
    
    const expiryDate = new Date(expiryDateString);
    onSubmit(name, expiryDate);
    
    // Reset form after submission
    setName("");
    
    // Only reset date if not editing
    if (!editingItem) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setExpiryDateString(`${yyyy}-${mm}-${dd}`);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name" className="text-sm font-medium text-slate-700">
              食品名
            </Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 牛乳"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiry-date" className="text-sm font-medium text-slate-700">
              期限日
            </Label>
            <Input
              id="expiry-date"
              type="date"
              value={expiryDateString}
              onChange={(e) => setExpiryDateString(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition"
            >
              {editingItem ? "更新" : "登録"}
            </Button>
            
            {editingItem && (
              <Button
                type="button"
                onClick={onCancelEdit}
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-md transition"
              >
                キャンセル
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
