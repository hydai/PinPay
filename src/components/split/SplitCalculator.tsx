import React, { useEffect, useState } from 'react';
import { Participant, Split, SplitMethod } from '../../types/split';
import { Input } from '../common/Input';
import { formatCurrency } from '../../utils/currency';

interface SplitCalculatorProps {
  totalAmount: number;
  participants: Participant[];
  splitMethod: SplitMethod;
  splits: Split[];
  onChange: (splits: Split[]) => void;
}

export const SplitCalculator: React.FC<SplitCalculatorProps> = ({
  totalAmount,
  participants,
  splitMethod,
  splits,
  onChange,
}) => {
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: string }>({});
  const [percentages, setPercentages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // 當參與者或分帳方式改變時，重新計算
    if (splitMethod === 'equal') {
      calculateEqualSplit();
    } else if (splitMethod === 'custom') {
      // 保留現有的自訂金額
      const newAmounts: { [key: string]: string } = {};
      participants.forEach((p) => {
        const existingSplit = splits.find((s) => s.participantId === p.id);
        newAmounts[p.id] = existingSplit ? existingSplit.amount.toString() : '0';
      });
      setCustomAmounts(newAmounts);
    } else if (splitMethod === 'percentage') {
      // 保留現有的百分比
      const newPercentages: { [key: string]: string } = {};
      participants.forEach((p) => {
        const existingSplit = splits.find((s) => s.participantId === p.id);
        newPercentages[p.id] = existingSplit?.percentage?.toString() || '0';
      });
      setPercentages(newPercentages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, splitMethod, totalAmount]);

  const calculateEqualSplit = () => {
    if (participants.length === 0) {
      onChange([]);
      return;
    }

    const amountPerPerson = totalAmount / participants.length;
    const newSplits: Split[] = participants.map((participant) => ({
      participantId: participant.id,
      amount: amountPerPerson,
      settled: false,
    }));

    onChange(newSplits);
  };

  const handleCustomAmountChange = (participantId: string, value: string) => {
    const newAmounts = { ...customAmounts, [participantId]: value };
    setCustomAmounts(newAmounts);

    const newSplits: Split[] = participants.map((participant) => ({
      participantId: participant.id,
      amount: parseFloat(newAmounts[participant.id] || '0') || 0,
      settled: false,
    }));

    onChange(newSplits);
  };

  const handlePercentageChange = (participantId: string, value: string) => {
    const newPercentages = { ...percentages, [participantId]: value };
    setPercentages(newPercentages);

    const newSplits: Split[] = participants.map((participant) => {
      const percentage = parseFloat(newPercentages[participant.id] || '0') || 0;
      return {
        participantId: participant.id,
        amount: (totalAmount * percentage) / 100,
        percentage,
        settled: false,
      };
    });

    onChange(newSplits);
  };

  const getTotalCustomAmount = () => {
    return Object.values(customAmounts).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  const getTotalPercentage = () => {
    return Object.values(percentages).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  };

  if (participants.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        請先選擇參與者
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {splitMethod === 'equal' && (
        <div>
          <div className="text-sm text-gray-600 mb-3">
            每人平均：<span className="font-semibold text-gray-900">{formatCurrency(totalAmount / participants.length)}</span>
          </div>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-gray-900">{participant.name}</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(totalAmount / participants.length)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {splitMethod === 'custom' && (
        <div>
          <div className="space-y-2 mb-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2">
                <span className="text-sm text-gray-700 w-20 flex-shrink-0">
                  {participant.name}
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={customAmounts[participant.id] || '0'}
                  onChange={(e) => handleCustomAmountChange(participant.id, e.target.value)}
                  step="1"
                  min="0"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg text-sm">
            <span className="text-gray-700">小計</span>
            <span className={`font-semibold ${
              Math.abs(getTotalCustomAmount() - totalAmount) < 0.01
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {formatCurrency(getTotalCustomAmount())} / {formatCurrency(totalAmount)}
            </span>
          </div>
          {Math.abs(getTotalCustomAmount() - totalAmount) >= 0.01 && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ 金額總和與支出金額不符
            </p>
          )}
        </div>
      )}

      {splitMethod === 'percentage' && (
        <div>
          <div className="space-y-2 mb-3">
            {participants.map((participant) => (
              <div key={participant.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 w-20 flex-shrink-0">
                    {participant.name}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={percentages[participant.id] || '0'}
                      onChange={(e) => handlePercentageChange(participant.id, e.target.value)}
                      step="1"
                      min="0"
                      max="100"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-right pr-12">
                  = {formatCurrency((totalAmount * (parseFloat(percentages[participant.id]) || 0)) / 100)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg text-sm">
            <span className="text-gray-700">總百分比</span>
            <span className={`font-semibold ${
              Math.abs(getTotalPercentage() - 100) < 0.01
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {getTotalPercentage().toFixed(1)}% / 100%
            </span>
          </div>
          {Math.abs(getTotalPercentage() - 100) >= 0.01 && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ 百分比總和必須等於 100%
            </p>
          )}
        </div>
      )}
    </div>
  );
};
