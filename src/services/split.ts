import { SplitInfo, Split, SplitCalculation, Participant } from '../types/split';

/**
 * 計算平均分帳
 */
export const calculateEqualSplit = (
  totalAmount: number,
  participants: Participant[],
  paidBy: string
): SplitInfo => {
  const count = participants.length;
  const amountPerPerson = totalAmount / count;

  const splits: Split[] = participants.map((participant) => ({
    participantId: participant.id,
    amount: amountPerPerson,
    settled: participant.id === paidBy, // 付款人自動結算
  }));

  return {
    participants,
    paidBy,
    splitMethod: 'equal',
    splits,
    settled: false,
  };
};

/**
 * 計算自訂金額分帳
 */
export const calculateCustomSplit = (
  splits: Split[],
  participants: Participant[],
  paidBy: string
): SplitInfo => {
  return {
    participants,
    paidBy,
    splitMethod: 'custom',
    splits: splits.map((split) => ({
      ...split,
      settled: split.participantId === paidBy,
    })),
    settled: false,
  };
};

/**
 * 計算百分比分帳
 */
export const calculatePercentageSplit = (
  totalAmount: number,
  percentages: { participantId: string; percentage: number }[],
  participants: Participant[],
  paidBy: string
): SplitInfo => {
  const splits: Split[] = percentages.map((item) => ({
    participantId: item.participantId,
    amount: (totalAmount * item.percentage) / 100,
    percentage: item.percentage,
    settled: item.participantId === paidBy,
  }));

  return {
    participants,
    paidBy,
    splitMethod: 'percentage',
    splits,
    settled: false,
  };
};

/**
 * 獲取分帳計算結果（誰欠誰多少錢）
 */
export const getSplitCalculations = (splitInfo: SplitInfo): SplitCalculation[] => {
  const { participants, paidBy, splits } = splitInfo;

  return participants.map((participant) => {
    const split = splits.find((s) => s.participantId === participant.id);
    const shouldPay = split?.amount || 0;
    const paid = participant.id === paidBy ? splits.reduce((sum, s) => sum + s.amount, 0) : 0;
    const balance = shouldPay - paid;

    return {
      participantId: participant.id,
      participantName: participant.name,
      shouldPay,
      paid,
      balance,
    };
  });
};

/**
 * 格式化分帳結果文字
 */
export const formatSplitSummary = (splitInfo: SplitInfo): string => {
  const calculations = getSplitCalculations(splitInfo);
  const payer = splitInfo.participants.find((p) => p.id === splitInfo.paidBy);

  const lines: string[] = [];
  lines.push(`付款人：${payer?.name || '未知'}`);
  lines.push('');

  calculations.forEach((calc) => {
    if (calc.participantId === splitInfo.paidBy) {
      lines.push(`${calc.participantName}: 已付款 NT$ ${calc.paid.toFixed(0)}`);
    } else if (calc.balance > 0) {
      lines.push(`${calc.participantName}: 欠 ${payer?.name} NT$ ${calc.balance.toFixed(0)}`);
    } else if (calc.balance < 0) {
      lines.push(`${calc.participantName}: ${payer?.name} 欠 NT$ ${Math.abs(calc.balance).toFixed(0)}`);
    } else {
      lines.push(`${calc.participantName}: 已結清`);
    }
  });

  return lines.join('\n');
};

/**
 * 驗證分帳金額總和
 */
export const validateSplitTotal = (
  splits: Split[],
  totalAmount: number,
  tolerance: number = 0.01
): boolean => {
  const sum = splits.reduce((total, split) => total + split.amount, 0);
  return Math.abs(sum - totalAmount) < tolerance;
};

/**
 * 驗證百分比總和
 */
export const validatePercentageTotal = (
  percentages: number[],
  tolerance: number = 0.01
): boolean => {
  const sum = percentages.reduce((total, percentage) => total + percentage, 0);
  return Math.abs(sum - 100) < tolerance;
};

/**
 * 調整分帳金額以符合總額（處理小數點誤差）
 */
export const adjustSplitsToTotal = (splits: Split[], totalAmount: number): Split[] => {
  const sum = splits.reduce((total, split) => total + split.amount, 0);
  const diff = totalAmount - sum;

  if (Math.abs(diff) < 0.01) {
    return splits;
  }

  // 將差額加到第一個分帳項目上
  const adjusted = [...splits];
  if (adjusted.length > 0) {
    adjusted[0] = {
      ...adjusted[0],
      amount: adjusted[0].amount + diff,
    };
  }

  return adjusted;
};

/**
 * 標記某人已結算
 */
export const markAsSettled = (
  splitInfo: SplitInfo,
  participantId: string
): SplitInfo => {
  const updatedSplits = splitInfo.splits.map((split) =>
    split.participantId === participantId ? { ...split, settled: true } : split
  );

  const allSettled = updatedSplits.every((split) => split.settled);

  return {
    ...splitInfo,
    splits: updatedSplits,
    settled: allSettled,
  };
};

/**
 * 取消結算
 */
export const markAsUnsettled = (
  splitInfo: SplitInfo,
  participantId: string
): SplitInfo => {
  const updatedSplits = splitInfo.splits.map((split) =>
    split.participantId === participantId ? { ...split, settled: false } : split
  );

  return {
    ...splitInfo,
    splits: updatedSplits,
    settled: false,
  };
};

/**
 * 獲取未結算的分帳項目
 */
export const getUnsettledSplits = (splitInfo: SplitInfo): Split[] => {
  return splitInfo.splits.filter((split) => !split.settled);
};

/**
 * 計算未結算金額
 */
export const getUnsettledAmount = (splitInfo: SplitInfo): number => {
  return splitInfo.splits
    .filter((split) => !split.settled)
    .reduce((sum, split) => sum + split.amount, 0);
};
