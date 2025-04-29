import FoodItem from "@/components/FoodItem";
import { FoodItem as FoodItemType } from "@/types";

interface FoodItemListProps {
  foodItems: FoodItemType[];
  onEdit: (item: FoodItemType) => void;
  onDelete: (id: string) => void;
}

export default function FoodItemList({ foodItems, onEdit, onDelete }: FoodItemListProps) {
  // Sort by expiration date (closest to expiring first)
  const sortedItems = [...foodItems].sort(
    (a, b) => a.expiryDate.getTime() - b.expiryDate.getTime()
  );

  return (
    <ul className="space-y-3">
      {sortedItems.length === 0 ? (
        <li className="text-center py-8 text-slate-500">
          登録されている食品はありません。
        </li>
      ) : (
        sortedItems.map((item) => (
          <FoodItem 
            key={item.id} 
            item={item} 
            onEdit={() => onEdit(item)} 
            onDelete={() => onDelete(item.id)} 
          />
        ))
      )}
    </ul>
  );
}
