import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FoodItem, StorageLocation } from "@/types";
import { useStorageLocations } from "@/hooks/useStorageLocations";
import { Loader2, Plus } from "lucide-react";

interface FoodItemFormProps {
  onSubmit: (name: string, expiryDate: Date, locationId: string) => void;
  editingItem: FoodItem | null;
  onCancelEdit: () => void;
}

export default function FoodItemForm({ 
  onSubmit, 
  editingItem, 
  onCancelEdit 
}: FoodItemFormProps) {
  const { locations, isLoading, addLocation } = useStorageLocations();
  const [name, setName] = useState("");
  const [expiryDateString, setExpiryDateString] = useState("");
  const [locationId, setLocationId] = useState("");
  const [newLocationName, setNewLocationName] = useState("");
  const [showAddLocation, setShowAddLocation] = useState(false);

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

  // デフォルトの保管場所を設定
  useEffect(() => {
    if (locations.length > 0 && !locationId) {
      setLocationId(locations[0].id);
    }
  }, [locations, locationId]);

  // When an item is set for editing, populate the form
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setExpiryDateString(editingItem.expiryDate.toISOString().split("T")[0]);
      if (editingItem.locationId && locations.some(loc => loc.id === editingItem.locationId)) {
        setLocationId(editingItem.locationId);
      }
    }
  }, [editingItem, locations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !expiryDateString) {
      alert("食品名と期限日を入力してください。");
      return;
    }
    
    const expiryDate = new Date(expiryDateString);
    onSubmit(name, expiryDate, locationId);
    
    // Reset form after submission
    setName("");
    
    // Only reset date if not editing
    if (!editingItem) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setExpiryDateString(`${yyyy}-${mm}-${dd}`);
      
      // デフォルトの保管場所にリセット
      if (locations.length > 0) {
        setLocationId(locations[0].id);
      }
    }
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) {
      alert("保管場所名を入力してください。");
      return;
    }

    const newLocation = await addLocation(newLocationName);
    if (newLocation) {
      setLocationId(newLocation.id);
      setNewLocationName("");
      setShowAddLocation(false);
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
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="location" className="text-sm font-medium text-slate-700">
                保管場所
              </Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAddLocation(!showAddLocation)}
                className="text-xs"
              >
                <Plus className="h-4 w-4 mr-1" />
                新規追加
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : showAddLocation ? (
              <div className="flex gap-2">
                <Input
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="新しい保管場所名"
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddLocation} size="sm">
                  追加
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddLocation(false)}
                  size="sm"
                >
                  キャンセル
                </Button>
              </div>
            ) : (
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger id="location" className="w-full">
                  <SelectValue placeholder="保管場所を選択" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
