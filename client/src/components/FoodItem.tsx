import { FoodItem as FoodItemType } from "@/types";
import { Button } from "@/components/ui/button";
import { getExpiryClass, getExpiryTextClass, calculateRemainingDays } from "@/utils/dateUtils";

interface FoodItemProps {
  item: FoodItemType;
  onEdit: () => void;
  onDelete: () => void;
}

export default function FoodItem({ item, onEdit, onDelete }: FoodItemProps) {
  const expiryClass = getExpiryClass(item.expiryDate);
  const textClass = getExpiryTextClass(item.expiryDate);
  const remainingDays = calculateRemainingDays(item.expiryDate);
  const formattedExpiryDate = item.expiryDate.toISOString().split("T")[0];
  
  // Check if expired for additional styling
  const isExpired = item.expiryDate < new Date(new Date().setHours(0, 0, 0, 0));
  const nameClass = isExpired ? "line-through" : "";
  
  return (
    <li className={`flex flex-col bg-white rounded-lg shadow-sm overflow-hidden ${expiryClass}`}>
      <div className="p-4 flex justify-between items-start">
        <div className="item-info">
          <span className={`item-name text-lg font-medium ${nameClass}`}>
            {item.name}
          </span>
          <span className={`item-date block text-sm ${textClass}`}>
            期限: {formattedExpiryDate} ({remainingDays})
          </span>
        </div>
        <div className="item-actions flex">
          <Button
            onClick={onEdit}
            variant="outline"
            className="edit-btn bg-sky-500 hover:bg-sky-600 text-white text-sm px-3 py-1 rounded mr-2"
            size="sm"
          >
            編集
          </Button>
          <Button
            onClick={onDelete}
            variant="destructive"
            className="delete-btn text-sm px-3 py-1 rounded"
            size="sm"
          >
            削除
          </Button>
        </div>
      </div>
    </li>
  );
}
