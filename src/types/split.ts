export interface SplitInfo {
  participants: Participant[];
  paidBy: string; // participant id
  splitMethod: SplitMethod;
  splits: Split[];
  settled: boolean;
}

export interface Participant {
  id: string;
  name: string;
  contact?: string; // phone or email
  avatar?: string;
}

export interface Split {
  participantId: string;
  amount: number;
  percentage?: number;
  settled: boolean;
}

export type SplitMethod = 'equal' | 'custom' | 'percentage';

export interface SplitCalculation {
  participantId: string;
  participantName: string;
  shouldPay: number;
  paid: number;
  balance: number; // positive means owes, negative means is owed
}
