# PinPay - 位置記帳 WebApp 技術規格

## 專案概述

PinPay 是一個結合 GPS 定位與快速記帳的 WebApp，支援照片記錄和分帳功能。

## 功能需求

### Phase 1: 核心功能 (MVP)

#### 1. 位置記錄
- [x] GPS 自動定位（使用 Geolocation API）
- [x] 手動輸入 Google Maps 分享連結
- [x] 解析 Google Maps URL 取得座標和地址
- [x] 顯示地圖預覽（可選）
- [x] 儲存經緯度和地址資訊

#### 2. 快速記帳
- [x] 金額輸入（支援小數點）
- [x] 支出名目/類別選擇
  - 預設類別：餐飲、交通、購物、娛樂、住宿、其他
  - 支援自訂類別
- [x] 支付方式選擇
  - 現金、信用卡、簽帳金融卡、行動支付（LINE Pay, Apple Pay 等）
  - 支援自訂支付方式
- [x] 備註欄位（選填）
- [x] 自動記錄時間戳記

#### 3. 照片記錄
- [x] 使用相機拍攝
- [x] 從圖庫選擇
- [x] 支援多張照片上傳
- [x] 照片預覽與刪除
- [x] 照片壓縮（控制儲存空間）

#### 4. 資料管理
- [x] 支出記錄列表
  - 按時間排序（最新在前）
  - 顯示金額、類別、位置、日期
- [x] 記錄詳細頁面
  - 完整資訊展示
  - 地圖位置顯示
  - 照片瀏覽
- [x] 編輯記錄
- [x] 刪除記錄
- [x] 搜尋功能（按類別、日期範圍）
- [x] 統計功能
  - 總支出
  - 類別分布
  - 時間趨勢

#### 5. 分帳功能
- [x] 標記支出為「需分帳」
- [x] 設定參與人員
  - 快速選擇常用聯絡人
  - 手動輸入參與者名稱
- [x] 分帳方式
  - 平均分攤
  - 自訂金額分配
  - 百分比分配
- [x] 分帳計算
  - 顯示每人應付金額
  - 誰付了錢、誰欠誰多少
- [x] 分帳記錄
  - 查看所有分帳項目
  - 結算狀態追蹤

### Phase 2: 進階功能（後續開發）

#### 1. 雲端同步
- [ ] Firebase Authentication（使用者登入）
- [ ] Firestore 資料同步
- [ ] Firebase Storage 照片同步
- [ ] 多裝置同步
- [ ] 離線優先架構

#### 2. 協作功能
- [ ] 分享支出記錄
- [ ] 群組記帳（旅遊、室友等）
- [ ] 即時協作編輯

#### 3. 進階分析
- [ ] 圖表視覺化
- [ ] 預算管理
- [ ] 消費習慣分析
- [ ] 匯出報表（CSV, PDF）

## 技術架構

### 技術棧

```
前端框架: React 18 + TypeScript
建構工具: Vite
樣式方案: Tailwind CSS
狀態管理: Zustand (輕量級)
本地儲存: IndexedDB (Dexie.js)
路由: React Router v6
定位服務: Geolocation API
地圖服務: Google Maps API (可選)
照片處理: Browser File API + Canvas API
PWA: Vite PWA Plugin
```

### 資料模型

```typescript
// 主要支出記錄
interface Expense {
  id: string;
  amount: number;
  category: string;
  paymentMethod: string;
  description?: string;
  location?: Location;
  photos: Photo[];
  timestamp: Date;
  splitInfo?: SplitInfo; // 分帳資訊
  createdAt: Date;
  updatedAt: Date;
}

// 位置資訊
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  googleMapsUrl?: string;
  placeName?: string;
}

// 照片資訊
interface Photo {
  id: string;
  data: string; // Base64 或 Blob URL
  thumbnail?: string; // 縮圖
  timestamp: Date;
}

// 分帳資訊
interface SplitInfo {
  participants: Participant[];
  paidBy: string; // 誰先付錢
  splitMethod: 'equal' | 'custom' | 'percentage';
  splits: Split[];
  settled: boolean; // 是否已結算
}

// 參與者
interface Participant {
  id: string;
  name: string;
  contact?: string; // 電話或 email
}

// 分帳明細
interface Split {
  participantId: string;
  amount: number;
  percentage?: number;
  settled: boolean;
}

// 類別設定
interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
}

// 支付方式
interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  isDefault: boolean;
}
```

### 專案結構

```
pinpay/
├── public/
│   ├── icons/              # PWA icons
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/         # UI 組件
│   │   ├── common/         # 通用組件
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Card.tsx
│   │   ├── expense/        # 記帳相關
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── ExpenseList.tsx
│   │   │   ├── ExpenseItem.tsx
│   │   │   └── ExpenseDetail.tsx
│   │   ├── location/       # 位置相關
│   │   │   ├── LocationPicker.tsx
│   │   │   ├── MapView.tsx
│   │   │   └── GoogleMapsInput.tsx
│   │   ├── photo/          # 照片相關
│   │   │   ├── PhotoCapture.tsx
│   │   │   ├── PhotoGallery.tsx
│   │   │   └── PhotoPreview.tsx
│   │   ├── split/          # 分帳相關
│   │   │   ├── SplitForm.tsx
│   │   │   ├── ParticipantSelector.tsx
│   │   │   ├── SplitCalculator.tsx
│   │   │   └── SplitSummary.tsx
│   │   └── layout/         # 版面組件
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── Navigation.tsx
│   ├── pages/              # 頁面組件
│   │   ├── Home.tsx
│   │   ├── AddExpense.tsx
│   │   ├── ExpenseDetail.tsx
│   │   ├── Statistics.tsx
│   │   ├── SplitManagement.tsx
│   │   └── Settings.tsx
│   ├── hooks/              # 自定義 Hooks
│   │   ├── useExpenses.ts
│   │   ├── useLocation.ts
│   │   ├── usePhoto.ts
│   │   ├── useSplit.ts
│   │   └── useLocalStorage.ts
│   ├── services/           # 業務邏輯服務
│   │   ├── database.ts     # IndexedDB 封裝
│   │   ├── location.ts     # 定位服務
│   │   ├── photo.ts        # 照片處理
│   │   ├── googleMaps.ts   # Google Maps API
│   │   └── split.ts        # 分帳計算
│   ├── store/              # Zustand 狀態管理
│   │   ├── expenseStore.ts
│   │   ├── settingsStore.ts
│   │   └── splitStore.ts
│   ├── types/              # TypeScript 類型定義
│   │   ├── expense.ts
│   │   ├── location.ts
│   │   ├── photo.ts
│   │   └── split.ts
│   ├── utils/              # 工具函數
│   │   ├── dateFormat.ts
│   │   ├── currency.ts
│   │   ├── validation.ts
│   │   └── compression.ts
│   ├── constants/          # 常數定義
│   │   ├── categories.ts
│   │   └── paymentMethods.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example            # 環境變數範例
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 開發階段

### Stage 1: 基礎建設 (Week 1)
- [x] 專案初始化
- [x] 技術棧設置（React, TypeScript, Vite, Tailwind）
- [x] 資料模型定義
- [x] IndexedDB 設置
- [x] 基礎 UI 組件庫

### Stage 2: 核心記帳功能 (Week 2)
- [x] 記帳表單
- [x] 類別與支付方式管理
- [x] 資料 CRUD 操作
- [x] 列表與詳細頁面

### Stage 3: 位置與照片 (Week 3)
- [x] GPS 定位整合
- [x] Google Maps 連結解析
- [x] 照片拍攝/上傳
- [x] 照片壓縮與儲存

### Stage 4: 分帳功能 (Week 4)
- [x] 參與者管理
- [x] 分帳計算邏輯
- [x] 分帳 UI
- [x] 結算追蹤

### Stage 5: 優化與 PWA (Week 5)
- [x] PWA 設定
- [x] 離線支援
- [x] 效能優化
- [x] UI/UX 調整
- [x] 測試與修復

### Stage 6: 雲端同步 (Future)
- [ ] Firebase 整合
- [ ] 認證系統
- [ ] 資料同步
- [ ] 多裝置支援

## 技術細節

### 定位服務實作

```typescript
// 1. GPS 定位
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // 反向地理編碼取得地址
  },
  (error) => {
    // 錯誤處理
  }
);

// 2. Google Maps URL 解析
// 支援格式:
// - https://maps.google.com/?q=25.0330,121.5654
// - https://goo.gl/maps/xxxxx
// - https://www.google.com/maps/place/...
```

### 照片處理

```typescript
// 壓縮策略:
// - 原圖: 最大 1920x1080, 品質 0.8
// - 縮圖: 200x200, 品質 0.6
// - 格式: WebP (若支援) 或 JPEG
// - 儲存: IndexedDB (Blob)
```

### 分帳計算範例

```typescript
// 平均分攤
total = 1000
participants = 3
perPerson = 1000 / 3 = 333.33

// 自訂分配
A: 400
B: 300
C: 300

// 百分比分配
A: 50% = 500
B: 30% = 300
C: 20% = 200
```

### PWA 功能

- 離線訪問
- 安裝到主畫面
- 推送通知（未來）
- 背景同步（未來）

## 效能目標

- 首次載入: < 2s
- 互動回應: < 100ms
- Lighthouse 分數: > 90
- 離線可用性: 100%

## 瀏覽器支援

- Chrome/Edge: 最新 2 個版本
- Safari iOS: 14+
- Firefox: 最新 2 個版本

## 安全性考量

- 所有資料儲存在本地 IndexedDB
- 照片不上傳至伺服器（Phase 1）
- 未來雲端同步需加密
- GPS 權限提示
- 相機權限提示

## 未來擴充

- 多語言支援 (i18n)
- 深色模式
- 匯入/匯出資料
- 與發票整合
- OCR 自動辨識收據
- 語音記帳
- Widget 小工具
- 手錶版本

## 成功指標

- 每筆記帳完成時間 < 30 秒
- 照片上傳成功率 > 95%
- GPS 定位成功率 > 90%
- 使用者留存率（待定義）
