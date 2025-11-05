import { SplitInfo } from './split';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  paymentMethod: string;
  description?: string;
  location?: Location;
  photos: Photo[];
  timestamp: Date;
  splitInfo?: SplitInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  googleMapsUrl?: string;
  placeName?: string;
}

export interface Photo {
  id: string;
  data: string; // Base64 or Blob URL
  thumbnail?: string;
  timestamp: Date;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
  isDefault: boolean;
}
