import React, { useState, useRef } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { dbHelpers } from '../services/database';
import { exportToCSV, exportToJSON, exportSplitSummary, importFromJSON } from '../utils/export';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      const expenses = await dbHelpers.getAllExpenses();
      exportToCSV(expenses);
    } catch (error) {
      console.error('匯出失敗:', error);
      alert('匯出失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setLoading(true);
      const expenses = await dbHelpers.getAllExpenses();
      exportToJSON(expenses);
    } catch (error) {
      console.error('匯出失敗:', error);
      alert('匯出失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSplit = async () => {
    try {
      setLoading(true);
      const expenses = await dbHelpers.getAllExpenses();
      exportSplitSummary(expenses);
    } catch (error) {
      console.error('匯出失敗:', error);
      alert('匯出失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('匯入資料將會覆蓋現有記錄，確定要繼續嗎？')) {
      return;
    }

    try {
      setLoading(true);
      const expenses = await importFromJSON(file);

      // 儲存到資料庫
      for (const expense of expenses) {
        await dbHelpers.addExpense(expense);
      }

      alert(`成功匯入 ${expenses.length} 筆記錄！`);

      // 重置檔案輸入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('匯入失敗:', error);
      alert(error instanceof Error ? error.message : '匯入失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('確定要清除所有資料嗎？此操作無法復原！')) {
      return;
    }

    if (!confirm('最後確認：真的要刪除所有記錄嗎？')) {
      return;
    }

    try {
      setLoading(true);
      const expenses = await dbHelpers.getAllExpenses();

      for (const expense of expenses) {
        await dbHelpers.deleteExpense(expense.id);
      }

      alert('已清除所有資料');
    } catch (error) {
      console.error('清除失敗:', error);
      alert('清除失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">設定</h1>

      <div className="space-y-4">
        {/* Export Section */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">資料匯出</h2>
          <p className="text-sm text-gray-600 mb-4">
            將您的記帳資料匯出，方便備份或在其他軟體中使用
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              fullWidth
              onClick={handleExportCSV}
              disabled={loading}
            >
              📊 匯出為 CSV（Excel 適用）
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={handleExportJSON}
              disabled={loading}
            >
              💾 匯出完整備份（JSON）
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={handleExportSplit}
              disabled={loading}
            >
              👥 匯出分帳記錄（CSV）
            </Button>
          </div>
        </Card>

        {/* Import Section */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">資料匯入</h2>
          <p className="text-sm text-gray-600 mb-4">
            從 JSON 備份檔案恢復資料
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
          <Button
            variant="outline"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            📥 匯入備份檔案
          </Button>
        </Card>

        {/* About Section */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">關於 PinPay</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>版本：0.2.0</p>
            <p>結合 GPS 定位與快速記帳的 WebApp</p>
          </div>
        </Card>

        {/* Feature Status */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">功能狀態</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>快速記帳</span>
              <span className="text-green-600">✓ 已完成</span>
            </div>
            <div className="flex justify-between">
              <span>GPS 定位</span>
              <span className="text-green-600">✓ 已完成</span>
            </div>
            <div className="flex justify-between">
              <span>照片記錄</span>
              <span className="text-green-600">✓ 已完成</span>
            </div>
            <div className="flex justify-between">
              <span>分帳功能</span>
              <span className="text-green-600">✓ 已完成</span>
            </div>
            <div className="flex justify-between">
              <span>統計圖表</span>
              <span className="text-green-600">✓ 已完成</span>
            </div>
            <div className="flex justify-between">
              <span>資料匯出</span>
              <span className="text-green-600">✓ 已完成</span>
            </div>
            <div className="flex justify-between">
              <span>雲端同步</span>
              <span className="text-gray-400">⏳ 規劃中</span>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">資料管理</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>所有資料儲存於本地瀏覽器 IndexedDB</p>
            <p>清除瀏覽器資料將會刪除所有記錄</p>
            <p className="text-yellow-600 font-medium">⚠️ 請定期備份重要資料</p>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-2 border-red-200">
          <h2 className="font-semibold text-red-600 mb-3">危險區域</h2>
          <p className="text-sm text-gray-600 mb-4">
            清除所有資料後將無法恢復，請謹慎操作
          </p>
          <Button
            variant="danger"
            fullWidth
            onClick={handleClearData}
            disabled={loading}
          >
            🗑️ 清除所有資料
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
