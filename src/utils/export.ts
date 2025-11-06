import { Expense } from '../types/expense';
import { formatDateTime } from './dateFormat';

/**
 * 將支出記錄匯出為 CSV
 */
export const exportToCSV = (expenses: Expense[]): void => {
  if (expenses.length === 0) {
    alert('沒有資料可以匯出');
    return;
  }

  // CSV 標題
  const headers = [
    '日期時間',
    '金額',
    '類別',
    '支付方式',
    '備註',
    '位置',
    '是否分帳',
    '參與者',
    '付款人',
  ];

  // 轉換資料
  const rows = expenses.map((expense) => {
    return [
      formatDateTime(expense.timestamp),
      expense.amount.toString(),
      expense.category,
      expense.paymentMethod,
      expense.description || '',
      expense.location?.address || expense.location ? `${expense.location.latitude},${expense.location.longitude}` : '',
      expense.splitInfo ? '是' : '否',
      expense.splitInfo ? expense.splitInfo.participants.map((p) => p.name).join(';') : '',
      expense.splitInfo ? expense.splitInfo.participants.find((p) => p.id === expense.splitInfo?.paidBy)?.name || '' : '',
    ];
  });

  // 組合 CSV 內容
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // 添加 BOM 讓 Excel 正確識別 UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // 下載文件
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const fileName = `PinPay_支出記錄_${new Date().toISOString().slice(0, 10)}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 將支出記錄匯出為 JSON
 */
export const exportToJSON = (expenses: Expense[]): void => {
  if (expenses.length === 0) {
    alert('沒有資料可以匯出');
    return;
  }

  const jsonContent = JSON.stringify(expenses, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const fileName = `PinPay_完整備份_${new Date().toISOString().slice(0, 10)}.json`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 從 JSON 檔案匯入資料
 */
export const importFromJSON = (file: File): Promise<Expense[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const expenses = JSON.parse(content) as Expense[];

        // 驗證資料格式
        if (!Array.isArray(expenses)) {
          throw new Error('檔案格式不正確');
        }

        // 轉換日期字串為 Date 物件
        const parsedExpenses = expenses.map((expense) => ({
          ...expense,
          timestamp: new Date(expense.timestamp),
          createdAt: new Date(expense.createdAt),
          updatedAt: new Date(expense.updatedAt),
          photos: expense.photos || [],
        }));

        resolve(parsedExpenses);
      } catch (error) {
        reject(new Error('解析檔案失敗，請確認檔案格式正確'));
      }
    };

    reader.onerror = () => {
      reject(new Error('讀取檔案失敗'));
    };

    reader.readAsText(file);
  });
};

/**
 * 匯出分帳摘要 CSV
 */
export const exportSplitSummary = (expenses: Expense[]): void => {
  const splitExpenses = expenses.filter((e) => e.splitInfo);

  if (splitExpenses.length === 0) {
    alert('沒有分帳資料可以匯出');
    return;
  }

  // CSV 標題
  const headers = [
    '日期',
    '金額',
    '類別',
    '付款人',
    '參與者',
    '分帳方式',
    '結算狀態',
  ];

  // 轉換資料
  const rows = splitExpenses.map((expense) => {
    const splitInfo = expense.splitInfo!;
    const payer = splitInfo.participants.find((p) => p.id === splitInfo.paidBy);

    return [
      formatDateTime(expense.timestamp),
      expense.amount.toString(),
      expense.category,
      payer?.name || '未知',
      splitInfo.participants.map((p) => p.name).join(';'),
      splitInfo.splitMethod === 'equal' ? '平均分攤' :
        splitInfo.splitMethod === 'custom' ? '自訂金額' : '百分比',
      splitInfo.settled ? '已結清' : '未結清',
    ];
  });

  // 組合 CSV 內容
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // 添加 BOM
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // 下載文件
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const fileName = `PinPay_分帳記錄_${new Date().toISOString().slice(0, 10)}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
