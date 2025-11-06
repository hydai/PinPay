/**
 * 格式化金額（新台幣）
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * 格式化金額（簡潔版，不含貨幣符號）
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('zh-TW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * 格式化金額（含小數）
 */
export const formatCurrencyWithDecimals = (amount: number): string => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * 解析金額字串
 */
export const parseAmount = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * 驗證金額
 */
export const isValidAmount = (value: string | number): boolean => {
  const amount = typeof value === 'string' ? parseAmount(value) : value;
  return !isNaN(amount) && amount >= 0;
};

/**
 * 格式化大額金額（使用千、萬、億）
 */
export const formatLargeAmount = (amount: number): string => {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)} 億`;
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(1)} 萬`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)} 千`;
  }
  return formatAmount(amount);
};
