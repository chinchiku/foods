import { useState } from "react";
import FoodItemForm from "@/components/FoodItemForm";
import FoodItemList from "@/components/FoodItemList";
import StatusLegend from "@/components/StatusLegend";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { useFoodItems } from "@/hooks/useFoodItems";
import { useStorageLocations } from "@/hooks/useStorageLocations";
import { FoodItem, StorageLocation } from "@/types";
import { Loader2, Plus, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const {
    foodItems,
    isLoading: foodLoading,
    error: foodError,
    addFoodItem,
    updateFoodItem,
    deleteFoodItem,
  } = useFoodItems();

  const {
    locations,
    isLoading: locationsLoading,
    error: locationsError,
    addLocation,
    updateLocation,
    deleteLocation
  } = useStorageLocations();

  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  // 保管場所管理
  const [newLocationName, setNewLocationName] = useState("");
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editingLocationName, setEditingLocationName] = useState("");

  const handleStartEdit = (item: FoodItem) => {
    setEditingItem(item);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleSubmit = (name: string, expiryDate: Date, locationId: string) => {
    if (editingItem) {
      updateFoodItem({
        ...editingItem,
        name,
        expiryDate,
        locationId,
      });
      setEditingItem(null);
    } else {
      addFoodItem({
        id: Date.now().toString(),
        name,
        expiryDate,
        locationId,
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteItemId) {
      deleteFoodItem(deleteItemId);
      setDeleteItemId(null);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) return;
    
    await addLocation(newLocationName);
    setNewLocationName("");
  };

  const handleUpdateLocation = async () => {
    if (!editingLocationId || !editingLocationName.trim()) return;
    
    await updateLocation(editingLocationId, editingLocationName);
    setEditingLocationId(null);
    setEditingLocationName("");
  };

  const handleDeleteLocation = async (id: string) => {
    if (confirm("この保管場所を削除してもよろしいですか？")) {
      await deleteLocation(id);
    }
  };

  const startEditLocation = (location: StorageLocation) => {
    setEditingLocationId(location.id);
    setEditingLocationName(location.name);
  };

  // 保管場所でフィルタリングされた食品リスト
  const filteredFoodItems = selectedLocationId
    ? foodItems.filter(item => item.locationId === selectedLocationId)
    : foodItems;

  return (
    <div className="max-w-md mx-auto p-4 pb-20">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center text-slate-800 mt-4">
            食品期限管理
          </h1>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                保管場所管理
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>保管場所の管理</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="mb-4">
                  <div className="flex items-end gap-2 mb-4">
                    <div className="flex-1">
                      <Label htmlFor="new-location" className="text-sm">新しい保管場所</Label>
                      <Input 
                        id="new-location" 
                        value={newLocationName} 
                        onChange={(e) => setNewLocationName(e.target.value)} 
                        placeholder="新しい保管場所名" 
                      />
                    </div>
                    <Button onClick={handleAddLocation}>追加</Button>
                  </div>
                  
                  <div className="text-sm font-medium mb-2">登録済み保管場所</div>
                  {locationsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {locations.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-2">保管場所がありません</p>
                      ) : (
                        locations.map(location => (
                          <div key={location.id} className="flex items-center justify-between border p-2 rounded-md">
                            {editingLocationId === location.id ? (
                              <div className="flex-1 flex items-center gap-2">
                                <Input 
                                  value={editingLocationName} 
                                  onChange={(e) => setEditingLocationName(e.target.value)} 
                                  className="flex-1"
                                />
                                <Button size="sm" onClick={handleUpdateLocation}>保存</Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => setEditingLocationId(null)}
                                >
                                  キャンセル
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span>{location.name}</span>
                                <div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => startEditLocation(location)}
                                  >
                                    編集
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-500" 
                                    onClick={() => handleDeleteLocation(location.id)}
                                  >
                                    削除
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">閉じる</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <FoodItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={handleCancelEdit}
        />
      </header>
      
      <StatusLegend />
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">登録済み食品一覧</h2>
        
        <Tabs defaultValue="all" onValueChange={(value) => setSelectedLocationId(value === "all" ? null : value)}>
          <TabsList className="w-full flex overflow-x-auto mb-4">
            <TabsTrigger value="all" className="flex-1">すべて</TabsTrigger>
            {locations.map(location => (
              <TabsTrigger key={location.id} value={location.id} className="flex-1">
                {location.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all">
            {foodLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : foodError ? (
              <div className="text-center text-red-500 py-4">{foodError}</div>
            ) : (
              <FoodItemList
                foodItems={foodItems}
                onEdit={handleStartEdit}
                onDelete={setDeleteItemId}
              />
            )}
          </TabsContent>
          
          {locations.map(location => (
            <TabsContent key={location.id} value={location.id}>
              {foodLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : foodError ? (
                <div className="text-center text-red-500 py-4">{foodError}</div>
              ) : (
                <FoodItemList
                  foodItems={foodItems.filter(item => item.locationId === location.id)}
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
