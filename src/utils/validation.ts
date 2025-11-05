/**
 * 驗證必填欄位
 */
export const required = (value: string | number | null | undefined): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * 驗證金額
 */
export const validateAmount = (amount: number): string | null => {
  if (isNaN(amount)) {
    return '請輸入有效的金額';
  }
  if (amount <= 0) {
    return '金額必須大於 0';
  }
  if (amount > 1000000000) {
    return '金額過大';
  }
  return null;
};

/**
 * 驗證 URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 驗證 Google Maps URL
 */
export const isGoogleMapsUrl = (url: string): boolean => {
  return (
    url.includes('maps.google.com') ||
    url.includes('google.com/maps') ||
    url.includes('goo.gl/maps') ||
    url.includes('maps.app.goo.gl')
  );
};

/**
 * 驗證 email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 驗證手機號碼（台灣）
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^09\d{8}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
};

/**
 * 生成唯一 ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
