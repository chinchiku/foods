export default function StatusLegend() {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
      <h2 className="font-medium text-lg mb-2">ステータスの説明</h2>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="w-4 h-6 bg-green-500 mr-2 rounded-sm"></div>
          <span className="text-sm">正常 (期限まで4日以上)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-6 bg-amber-300 mr-2 rounded-sm"></div>
          <span className="text-sm">もうすぐ期限切れ (期限まで1〜3日)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-6 bg-amber-500 mr-2 rounded-sm"></div>
          <span className="text-sm">今日期限</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-6 bg-slate-400 mr-2 rounded-sm"></div>
          <span className="text-sm">期限切れ</span>
        </div>
      </div>
    </div>
  );
}