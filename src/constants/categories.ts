import { Category } from '../types/expense';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: '餐飲',
    icon: '🍽️',
    color: '#FF6B6B',
    isDefault: true,
  },
  {
    id: 'transport',
    name: '交通',
    icon: '🚗',
    color: '#4ECDC4',
    isDefault: true,
  },
  {
    id: 'shopping',
    name: '購物',
    icon: '🛍️',
    color: '#FFE66D',
    isDefault: true,
  },
  {
    id: 'entertainment',
    name: '娛樂',
    icon: '🎬',
    color: '#95E1D3',
    isDefault: true,
  },
  {
    id: 'accommodation',
    name: '住宿',
    icon: '🏨',
    color: '#F38181',
    isDefault: true,
  },
  {
    id: 'healthcare',
    name: '醫療',
    icon: '💊',
    color: '#AA96DA',
    isDefault: true,
  },
  {
    id: 'education',
    name: '教育',
    icon: '📚',
    color: '#FCBAD3',
    isDefault: true,
  },
  {
    id: 'utilities',
    name: '生活繳費',
    icon: '💡',
    color: '#A8D8EA',
    isDefault: true,
  },
  {
    id: 'other',
    name: '其他',
    icon: '📌',
    color: '#C7CEEA',
    isDefault: true,
  },
];
