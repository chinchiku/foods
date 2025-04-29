import { useState } from "react";
import FoodItemList from "@/components/FoodItemList";
import StatusLegend from "@/components/StatusLegend";
import DeleteConfirmation from "@/components/DeleteConfirmation";
import { useFoodItems } from "@/hooks/useFoodItems";
import { useStorageLocations } from "@/hooks/useStorageLocations";
import { FoodItem, StorageLocation } from "@/types";
import { Loader2, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

interface ListPageProps {
  onEdit: (item: FoodItem) => void;
  onDeleteConfirm: (id: string) => void;
}

export default function ListPage({ onEdit, onDeleteConfirm }: ListPageProps) {
  const {
    foodItems,
    isLoading: foodLoading,
    error: foodError,
  } = useFoodItems();

  const {
    locations,
    isLoading: locationsLoading,
    error: locationsError,
    addLocation,
    updateLocation,
    deleteLocation
  } = useStorageLocations();

  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  
  // 保管場所管理
  const [newLocationName, setNewLocationName] = useState("");
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editingLocationName, setEditingLocationName] = useState("");
  
  const [location, setLocation] = useLocation();

  const handleDeleteConfirm = () => {
    if (deleteItemId) {
      onDeleteConfirm(deleteItemId);
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
    try {
      // まず、通常の削除を試みる
      await deleteLocation(id);
    } catch (error: any) {
      // 応答がある場合のみ処理
      if (!error.response) {
        console.error('Error deleting location:', error);
        return;
      }

      // レスポンスをJSONとして解析
      try {
        const responseData = await error.response.json();
        
        // 使用中の場合、確認ダイアログを表示
        if (responseData.message && responseData.itemsCount) {
          const confirmMessage = `${responseData.message}\n(この保管場所には${responseData.itemsCount}個のアイテムが登録されています)`;
          
          if (confirm(confirmMessage)) {
            // 強制削除を実行
            try {
              await deleteLocation(id, true);
            } catch (forceError) {
              console.error('Error force deleting location:', forceError);
            }
          }
        }
      } catch (jsonError) {
        console.error('Error parsing response:', jsonError);
      }
    }
  };

  const startEditLocation = (location: StorageLocation) => {
    setEditingLocationId(location.id);
    setEditingLocationName(location.name);
  };

  const handleRegisterClick = () => {
    setLocation("/register");
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">登録済み食品一覧</h2>
        
        <div className="flex gap-2">
          <Button onClick={handleRegisterClick} variant="outline" size="sm">
            新規登録
          </Button>
          
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
      </div>
      
      <StatusLegend />
      
      <div className="mb-6">
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
              <div>
                {/* 期限が登録されている食品 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                    期限登録済みの食品
                  </h3>
                  {foodItems.filter(item => !item.hasNoExpiry && item.expiryDate).length > 0 ? (
                    <FoodItemList
                      foodItems={foodItems
                        .filter(item => !item.hasNoExpiry && item.expiryDate)
                        .sort((a, b) => {
                          // 期限が近い順にソート
                          const dateA = new Date(a.expiryDate || 0);
                          const dateB = new Date(b.expiryDate || 0);
                          return dateA.getTime() - dateB.getTime();
                        })}
                      onEdit={onEdit}
                      onDelete={setDeleteItemId}
                    />
                  ) : (
                    <p className="text-gray-500 py-4 text-center">期限が登録されている食品はありません</p>
                  )}
                </div>
                
                {/* 期限なし食品（経過日数表示） */}
                <div className="mt-8 pt-4 border-t">
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                    期限登録なしの食品（経過日数）
                  </h3>
                  {foodItems.filter(item => item.hasNoExpiry).length > 0 ? (
                    <FoodItemList
                      foodItems={foodItems
                        .filter(item => item.hasNoExpiry)
                        .sort((a, b) => {
                          // 登録が古い順にソート（登録日が古いものが上に）
                          const dateA = new Date(a.registrationDate || 0);
                          const dateB = new Date(b.registrationDate || 0);
                          return dateA.getTime() - dateB.getTime();
                        })}
                      onEdit={onEdit}
                      onDelete={setDeleteItemId}
                    />
                  ) : (
                    <p className="text-gray-500 py-4 text-center">期限なしの食品はありません</p>
                  )}
                </div>
              </div>
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
                <div>
                  {/* 期限が登録されている食品 */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                      期限登録済みの食品
                    </h3>
                    {foodItems.filter(item => !item.hasNoExpiry && item.expiryDate && item.locationId === location.id).length > 0 ? (
                      <FoodItemList
                        foodItems={foodItems
                          .filter(item => !item.hasNoExpiry && item.expiryDate && item.locationId === location.id)
                          .sort((a, b) => {
                            // 期限が近い順にソート
                            const dateA = new Date(a.expiryDate || 0);
                            const dateB = new Date(b.expiryDate || 0);
                            return dateA.getTime() - dateB.getTime();
                          })}
                        onEdit={onEdit}
                        onDelete={setDeleteItemId}
                      />
                    ) : (
                      <p className="text-gray-500 py-4 text-center">期限が登録されている食品はありません</p>
                    )}
                  </div>
                  
                  {/* 期限なし食品（経過日数表示） */}
                  <div className="mt-8 pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                      期限登録なしの食品（経過日数）
                    </h3>
                    {foodItems.filter(item => item.hasNoExpiry && item.locationId === location.id).length > 0 ? (
                      <FoodItemList
                        foodItems={foodItems
                          .filter(item => item.hasNoExpiry && item.locationId === location.id)
                          .sort((a, b) => {
                            // 登録が古い順にソート（登録日が古いものが上に）
                            const dateA = new Date(a.registrationDate || 0);
                            const dateB = new Date(b.registrationDate || 0);
                            return dateA.getTime() - dateB.getTime();
                          })}
                        onEdit={onEdit}
                        onDelete={setDeleteItemId}
                      />
                    ) : (
                      <p className="text-gray-500 py-4 text-center">期限なしの食品はありません</p>
                    )}
                  </div>
                </div>
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