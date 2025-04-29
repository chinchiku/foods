import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FoodItem, StorageLocation } from "@/types";
import { useStorageLocations } from "@/hooks/useStorageLocations";
import { Loader2, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface FoodItemFormProps {
  onSubmit: (name: string, expiryDate: Date | undefined, locationId: string, hasNoExpiry: boolean, registrationDate: Date) => void;
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
  const [registrationDateString, setRegistrationDateString] = useState("");
  const [locationId, setLocationId] = useState("");
  const [newLocationName, setNewLocationName] = useState("");
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [hasNoExpiry, setHasNoExpiry] = useState(false);

  // 現在の日付を文字列にフォーマットする
  const formatDateToString = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // コンポーネントマウント時にデフォルトの日付を設定
  useEffect(() => {
    const today = new Date();
    
    // 期限日のデフォルトを設定
    if (!expiryDateString) {
      setExpiryDateString(formatDateToString(today));
    }
    
    // 登録日のデフォルトを設定
    if (!registrationDateString) {
      setRegistrationDateString(formatDateToString(today));
    }
  }, [expiryDateString, registrationDateString]);

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
      
      if (editingItem.expiryDate) {
        setExpiryDateString(formatDateToString(editingItem.expiryDate));
        setHasNoExpiry(false);
      } else {
        setHasNoExpiry(true);
      }
      
      setRegistrationDateString(formatDateToString(editingItem.registrationDate));
      
      if (editingItem.locationId && locations.some(loc => loc.id === editingItem.locationId)) {
        setLocationId(editingItem.locationId);
      }

      setHasNoExpiry(editingItem.hasNoExpiry || false);
    }
  }, [editingItem, locations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      alert("食品名を入力してください。");
      return;
    }
    
    // 期限なしフラグがfalseの場合、期限日が必要
    if (!hasNoExpiry && !expiryDateString) {
      alert("期限日を入力してください。");
      return;
    }
    
    // 登録日は必須
    if (!registrationDateString) {
      alert("登録日を入力してください。");
      return;
    }
    
    const expiryDate = hasNoExpiry ? undefined : new Date(expiryDateString);
    const registrationDate = new Date(registrationDateString);
    
    onSubmit(name, expiryDate, locationId, hasNoExpiry, registrationDate);
    
    // Reset form after submission
    setName("");
    
    // Only reset dates if not editing
    if (!editingItem) {
      const today = new Date();
      setExpiryDateString(formatDateToString(today));
      setRegistrationDateString(formatDateToString(today));
      setHasNoExpiry(false);
      
      // デフォルトの保管場所にリセット
      if (locations.length > 0) {
        setLocationId(locations[0].id);
      }
    }
  };
  
  // 期限なしチェックボックスの変更処理
  const handleNoExpiryChange = (checked: boolean) => {
    setHasNoExpiry(checked);
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
            <Label htmlFor="registration-date" className="text-sm font-medium text-slate-700">
              登録日
            </Label>
            <Input
              id="registration-date"
              type="date"
              value={registrationDateString}
              onChange={(e) => setRegistrationDateString(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="expiry-date" className="text-sm font-medium text-slate-700">
                期限日
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="no-expiry" 
                  checked={hasNoExpiry} 
                  onCheckedChange={handleNoExpiryChange} 
                />
                <Label 
                  htmlFor="no-expiry" 
                  className="text-sm cursor-pointer"
                >
                  期限なし
                </Label>
              </div>
            </div>
            <Input
              id="expiry-date"
              type="date"
              value={expiryDateString}
              onChange={(e) => setExpiryDateString(e.target.value)}
              required={!hasNoExpiry}
              disabled={hasNoExpiry}
              className={`w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${hasNoExpiry ? 'opacity-50' : ''}`}
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
