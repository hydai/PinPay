import React from 'react';
import { SplitInfo } from '../../types/split';
import { getSplitCalculations } from '../../services/split';
import { formatCurrency } from '../../utils/currency';
import { Card } from '../common/Card';

interface SplitSummaryProps {
  splitInfo: SplitInfo;
}

export const SplitSummary: React.FC<SplitSummaryProps> = ({ splitInfo }) => {
  const calculations = getSplitCalculations(splitInfo);
  const payer = splitInfo.participants.find((p) => p.id === splitInfo.paidBy);

  const getSplitMethodName = () => {
    switch (splitInfo.splitMethod) {
      case 'equal':
        return '平均分攤';
      case 'custom':
        return '自訂金額';
      case 'percentage':
        return '百分比';
      default:
        return '未知';
    }
  };

  return (
    <Card>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="font-semibold text-gray-900">分帳明細</h3>
          <span className="text-sm text-gray-600">{getSplitMethodName()}</span>
        </div>

        {/* Payer Info */}
        <div className="bg-primary-50 rounded-lg p-3">
          <div className="text-sm text-primary-700 mb-1">付款人</div>
          <div className="font-semibold text-primary-900">{payer?.name || '未知'}</div>
        </div>

        {/* Split Details */}
        <div className="space-y-2">
          {calculations.map((calc) => (
            <div
              key={calc.participantId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{calc.participantName}</div>
                <div className="text-sm text-gray-600">
                  應付 {formatCurrency(calc.shouldPay)}
                </div>
              </div>
              <div className="text-right">
                {calc.participantId === splitInfo.paidBy ? (
                  <span className="text-sm text-green-600 font-medium">
                    ✓ 已付款
                  </span>
                ) : calc.balance > 0 ? (
                  <div>
                    <div className="text-sm text-gray-600">欠款</div>
                    <div className="font-semibold text-red-600">
                      {formatCurrency(calc.balance)}
                    </div>
                  </div>
                ) : calc.balance < 0 ? (
                  <div>
                    <div className="text-sm text-gray-600">應收</div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(Math.abs(calc.balance))}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">已結清</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Debt Summary */}
        <div className="pt-3 border-t">
          <div className="text-sm text-gray-600 mb-2">欠款摘要</div>
          <div className="space-y-1">
            {calculations
              .filter((calc) => calc.balance > 0 && calc.participantId !== splitInfo.paidBy)
              .map((calc) => (
                <div key={calc.participantId} className="text-sm text-gray-700">
                  <span className="font-medium">{calc.participantName}</span>
                  <span className="text-gray-500"> 欠 </span>
                  <span className="font-medium">{payer?.name}</span>
                  <span className="text-gray-500"> </span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(calc.balance)}
                  </span>
                </div>
              ))}
            {calculations.filter((calc) => calc.balance > 0 && calc.participantId !== splitInfo.paidBy).length === 0 && (
              <div className="text-sm text-gray-500">全部結清</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
