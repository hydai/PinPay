import { Expense } from '../types/expense';

export interface DailyStats {
  date: string;
  total: number;
  count: number;
}

export interface CategoryStats {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyStats {
  month: string;
  total: number;
  count: number;
}

/**
 * 計算每日統計
 */
export const calculateDailyStats = (expenses: Expense[], days: number = 30): DailyStats[] => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // 創建日期映射
  const dateMap = new Map<string, { total: number; count: number }>();

  // 初始化所有日期
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = formatDateKey(date);
    dateMap.set(dateKey, { total: 0, count: 0 });
  }

  // 填充實際數據
  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.timestamp);
    if (expenseDate >= startDate) {
      const dateKey = formatDateKey(expenseDate);
      const current = dateMap.get(dateKey) || { total: 0, count: 0 };
      dateMap.set(dateKey, {
        total: current.total + expense.amount,
        count: current.count + 1,
      });
    }
  });

  // 轉換為數組
  return Array.from(dateMap.entries()).map(([date, stats]) => ({
    date,
    ...stats,
  }));
};

/**
 * 計算類別統計
 */
export const calculateCategoryStats = (expenses: Expense[]): CategoryStats[] => {
  const categoryMap = new Map<string, { total: number; count: number }>();
  let grandTotal = 0;

  expenses.forEach((expense) => {
    const current = categoryMap.get(expense.category) || { total: 0, count: 0 };
    categoryMap.set(expense.category, {
      total: current.total + expense.amount,
      count: current.count + 1,
    });
    grandTotal += expense.amount;
  });

  return Array.from(categoryMap.entries())
    .map(([category, stats]) => ({
      category,
      total: stats.total,
      count: stats.count,
      percentage: grandTotal > 0 ? (stats.total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

/**
 * 計算月度統計
 */
export const calculateMonthlyStats = (expenses: Expense[], months: number = 6): MonthlyStats[] => {
  const now = new Date();
  const monthMap = new Map<string, { total: number; count: number }>();

  // 初始化月份
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = formatMonthKey(date);
    monthMap.set(monthKey, { total: 0, count: 0 });
  }

  // 填充數據
  expenses.forEach((expense) => {
    const monthKey = formatMonthKey(expense.timestamp);
    const current = monthMap.get(monthKey);
    if (current) {
      monthMap.set(monthKey, {
        total: current.total + expense.amount,
        count: current.count + 1,
      });
    }
  });

  return Array.from(monthMap.entries()).map(([month, stats]) => ({
    month,
    ...stats,
  }));
};

/**
 * 獲取支付方式統計
 */
export const calculatePaymentMethodStats = (expenses: Expense[]) => {
  const methodMap = new Map<string, { total: number; count: number }>();

  expenses.forEach((expense) => {
    const current = methodMap.get(expense.paymentMethod) || { total: 0, count: 0 };
    methodMap.set(expense.paymentMethod, {
      total: current.total + expense.amount,
      count: current.count + 1,
    });
  });

  return Array.from(methodMap.entries())
    .map(([method, stats]) => ({
      method,
      ...stats,
    }))
    .sort((a, b) => b.total - a.total);
};

/**
 * 計算統計摘要
 */
export const calculateSummary = (expenses: Expense[]) => {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const count = expenses.length;
  const average = count > 0 ? total / count : 0;

  // 最大單筆支出
  const maxExpense = expenses.reduce(
    (max, expense) => (expense.amount > max.amount ? expense : max),
    expenses[0] || { amount: 0 }
  );

  // 本月支出
  const now = new Date();
  const thisMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.timestamp);
    return (
      expenseDate.getMonth() === now.getMonth() &&
      expenseDate.getFullYear() === now.getFullYear()
    );
  });
  const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // 上月支出
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.timestamp);
    return (
      expenseDate.getMonth() === lastMonth.getMonth() &&
      expenseDate.getFullYear() === lastMonth.getFullYear()
    );
  });
  const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return {
    total,
    count,
    average,
    maxExpense,
    thisMonthTotal,
    lastMonthTotal,
    monthlyChange: lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0,
  };
};

/**
 * 格式化日期鍵（YYYY-MM-DD）
 */
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 格式化月份鍵（YYYY-MM）
 */
const formatMonthKey = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};
