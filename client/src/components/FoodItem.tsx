import { FoodItem as FoodItemType, StorageLocation } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getExpiryClass, getExpiryTextClass, calculateRemainingDays } from "@/utils/dateUtils";
import { useStorageLocations } from "@/hooks/useStorageLocations";
import { CalendarClock, Calendar } from "lucide-react";

interface FoodItemProps {
  item: FoodItemType;
  onEdit: () => void;
  onDelete: () => void;
}

export default function FoodItem({ item, onEdit, onDelete }: FoodItemProps) {
  const { locations } = useStorageLocations();
  
  // 保管場所名を取得
  const locationName = item.locationId 
    ? locations.find(loc => loc.id === item.locationId)?.name || "不明な場所"
    : "未分類";
  
  // ステータスを計算
  const remainingDays = calculateRemainingDays(item.expiryDate, item.registrationDate, item.hasNoExpiry);
  
  // 期限切れかどうかチェック
  let nameClass = "";
  let itemBorderClass = "border-l-4 border-green-500";
  let dateTextClass = "text-slate-600";
  
  if (item.hasNoExpiry) {
    // 期限なし食品の場合、特別なスタイルはなし
    itemBorderClass = "border-l-4 border-blue-500";
    dateTextClass = "text-blue-600";
  } else if (item.expiryDate) {
    // 期限付き食品の場合
    const isExpired = item.expiryDate < new Date(new Date().setHours(0, 0, 0, 0));
    nameClass = isExpired ? "line-through" : "";
    itemBorderClass = getExpiryClass(item.expiryDate);
    dateTextClass = getExpiryTextClass(item.expiryDate);
  }
  
  return (
    <li className={`flex flex-col bg-white rounded-lg shadow-sm overflow-hidden ${itemBorderClass} transition-all duration-300 hover:shadow-md`}>
      <div className="p-4 flex justify-between items-start">
        <div className="item-info">
          <div className="flex items-center gap-2 mb-1">
            <span className={`item-name text-lg ${nameClass}`}>
              {item.name}
            </span>
            {locationName && (
              <Badge variant="outline" className="bg-slate-100 text-xs">
                {locationName}
              </Badge>
            )}
          </div>
          <div className={`item-date flex items-center gap-1 text-sm ${dateTextClass}`}>
            {item.hasNoExpiry ? (
              <>
                <CalendarClock className="h-3.5 w-3.5" />
                <span>登録日: {item.registrationDate.toISOString().split("T")[0]} ({remainingDays})</span>
              </>
            ) : item.expiryDate ? (
              <>
                <Calendar className="h-3.5 w-3.5" />
                <span>期限: {item.expiryDate.toISOString().split("T")[0]} ({remainingDays})</span>
              </>
            ) : (
              <span>期限情報なし</span>
            )}
          </div>
        </div>
        <div className="item-actions flex">
          <Button
            onClick={onEdit}
            variant="outline"
            className="edit-btn bg-sky-500 hover:bg-sky-600 text-white text-sm px-3 py-1 rounded mr-2 transition-colors"
            size="sm"
          >
            編集
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="delete-btn text-sm px-3 py-1 rounded transition-colors"
            size="sm"
          >
            削除
          </Button>
        </div>
      </div>
    </li>
  );
}
