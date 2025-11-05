import React from 'react';
import { Card } from '../components/common/Card';

const Settings: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">設定</h1>

      <div className="space-y-4">
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">關於 PinPay</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>版本：0.1.0</p>
            <p>結合 GPS 定位與快速記帳的 WebApp</p>
          </div>
        </Card>

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
              <span className="text-yellow-600">🔨 開發中</span>
            </div>
            <div className="flex justify-between">
              <span>雲端同步</span>
              <span className="text-gray-400">⏳ 規劃中</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">資料管理</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>所有資料儲存於本地瀏覽器</p>
            <p>清除瀏覽器資料將會刪除所有記錄</p>
            <p className="text-yellow-600 mt-3">⚠️ 請定期備份重要資料</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
