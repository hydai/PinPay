import React, { useState, useEffect } from 'react';
import { SplitInfo, Participant, Split, SplitMethod } from '../../types/split';
import { ParticipantSelector } from './ParticipantSelector';
import { SplitCalculator } from './SplitCalculator';
import { validateSplitTotal, validatePercentageTotal } from '../../services/split';

interface SplitFormProps {
  totalAmount: number;
  splitInfo: SplitInfo | undefined;
  onChange: (splitInfo: SplitInfo | undefined) => void;
}

export const SplitForm: React.FC<SplitFormProps> = ({
  totalAmount,
  splitInfo,
  onChange,
}) => {
  const [enableSplit, setEnableSplit] = useState(!!splitInfo);
  const [participants, setParticipants] = useState<Participant[]>(splitInfo?.participants || []);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(splitInfo?.splitMethod || 'equal');
  const [paidBy, setPaidBy] = useState<string>(splitInfo?.paidBy || '');
  const [splits, setSplits] = useState<Split[]>(splitInfo?.splits || []);

  useEffect(() => {
    if (enableSplit && participants.length > 0 && paidBy && splits.length > 0) {
      // 驗證分帳金額
      let isValid = true;
      if (splitMethod === 'custom') {
        isValid = validateSplitTotal(splits, totalAmount);
      } else if (splitMethod === 'percentage') {
        const percentages = splits.map((s) => s.percentage || 0);
        isValid = validatePercentageTotal(percentages);
      }

      if (isValid) {
        const newSplitInfo: SplitInfo = {
          participants,
          paidBy,
          splitMethod,
          splits: splits.map((split) => ({
            ...split,
            settled: split.participantId === paidBy, // 付款人自動標記為已結算
          })),
          settled: false,
        };
        onChange(newSplitInfo);
      }
    } else if (!enableSplit) {
      onChange(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableSplit, participants, splitMethod, paidBy, splits, totalAmount]);

  useEffect(() => {
    // 當參與者改變時，如果付款人不在列表中，清除付款人
    if (paidBy && !participants.find((p) => p.id === paidBy)) {
      setPaidBy('');
    }
  }, [participants, paidBy]);

  const handleToggleSplit = (enabled: boolean) => {
    setEnableSplit(enabled);
    if (!enabled) {
      onChange(undefined);
    }
  };

  const handleParticipantsChange = (newParticipants: Participant[]) => {
    setParticipants(newParticipants);

    // 如果只有一個參與者，自動設為付款人
    if (newParticipants.length === 1) {
      setPaidBy(newParticipants[0].id);
    }
  };

  const handleSplitMethodChange = (method: SplitMethod) => {
    setSplitMethod(method);
    // 清空現有的分帳金額，讓計算器重新計算
    setSplits([]);
  };

  const canSubmit = () => {
    if (!enableSplit) return true;
    if (participants.length === 0) return false;
    if (!paidBy) return false;
    if (splits.length === 0) return false;

    if (splitMethod === 'custom') {
      return validateSplitTotal(splits, totalAmount);
    } else if (splitMethod === 'percentage') {
      const percentages = splits.map((s) => s.percentage || 0);
      return validatePercentageTotal(percentages);
    }

    return true;
  };

  return (
    <div className="space-y-4">
      {/* Enable/Disable Split */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          需要分帳嗎？
        </label>
        <button
          type="button"
          onClick={() => handleToggleSplit(!enableSplit)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enableSplit ? 'bg-primary-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enableSplit ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {enableSplit && (
        <>
          {/* Participant Selector */}
          <div>
            <ParticipantSelector
              selectedParticipants={participants}
              onChange={handleParticipantsChange}
            />
          </div>

          {participants.length > 0 && (
            <>
              {/* Payer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  誰付款？*
                </label>
                <div className="flex flex-wrap gap-2">
                  {participants.map((participant) => (
                    <button
                      key={participant.id}
                      type="button"
                      onClick={() => setPaidBy(participant.id)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                        paidBy === participant.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {participant.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分帳方式 *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSplitMethodChange('equal')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      splitMethod === 'equal'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">⚖️</div>
                    <div className="text-xs font-medium">平均分攤</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSplitMethodChange('custom')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      splitMethod === 'custom'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">✏️</div>
                    <div className="text-xs font-medium">自訂金額</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSplitMethodChange('percentage')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      splitMethod === 'percentage'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">📊</div>
                    <div className="text-xs font-medium">百分比</div>
                  </button>
                </div>
              </div>

              {/* Split Calculator */}
              {paidBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分帳計算
                  </label>
                  <SplitCalculator
                    totalAmount={totalAmount}
                    participants={participants}
                    splitMethod={splitMethod}
                    splits={splits}
                    onChange={setSplits}
                  />
                </div>
              )}

              {/* Validation Warning */}
              {!canSubmit() && splits.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ 請確認分帳金額正確後再儲存
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
