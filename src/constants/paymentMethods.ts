import { PaymentMethod } from '../types/expense';

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cash',
    name: '現金',
    icon: '💵',
    isDefault: true,
  },
  {
    id: 'credit-card',
    name: '信用卡',
    icon: '💳',
    isDefault: true,
  },
  {
    id: 'debit-card',
    name: '簽帳金融卡',
    icon: '💳',
    isDefault: true,
  },
  {
    id: 'line-pay',
    name: 'LINE Pay',
    icon: '📱',
    isDefault: true,
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: '🍎',
    isDefault: true,
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    icon: '📱',
    isDefault: true,
  },
  {
    id: 'jko-pay',
    name: '街口支付',
    icon: '📱',
    isDefault: true,
  },
  {
    id: 'easy-wallet',
    name: '悠遊付',
    icon: '📱',
    isDefault: true,
  },
  {
    id: 'other',
    name: '其他',
    icon: '💰',
    isDefault: true,
  },
];
