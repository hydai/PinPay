import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Expense } from '../types/expense';
import { Participant, Split } from '../types/split';
import { dbHelpers } from '../services/database';
import { markAsSettled, markAsUnsettled } from '../services/split';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SplitSummary } from '../components/split/SplitSummary';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/dateFormat';
import { generateGoogleMapsUrl } from '../services/location';

const ExpenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadExpense(id);
    }
  }, [id]);

  const loadExpense = async (expenseId: string) => {
    try {
      const data = await dbHelpers.getExpense(expenseId);
      if (data) {
        setExpense(data);
      } else {
        alert('找不到此筆記錄');
        navigate('/');
      }
    } catch (error) {
      console.error('載入記錄失敗:', error);
      alert('載入失敗');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!expense) return;

    if (confirm('確定要刪除這筆記錄嗎？')) {
      try {
        await dbHelpers.deleteExpense(expense.id);
        alert('刪除成功');
        navigate('/');
      } catch (error) {
        console.error('刪除失敗:', error);
        alert('刪除失敗，請重試');
      }
    }
  };

  const handleToggleSettled = async (participantId: string, currentStatus: boolean) => {
    if (!expense || !expense.splitInfo) return;

    try {
      const newSplitInfo = currentStatus
        ? markAsUnsettled(expense.splitInfo, participantId)
        : markAsSettled(expense.splitInfo, participantId);

      await dbHelpers.updateExpense(expense.id, {
        splitInfo: newSplitInfo,
      });

      // 重新載入
      await loadExpense(expense.id);
    } catch (error) {
      console.error('更新結算狀態失敗:', error);
      alert('更新失敗，請重試');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (!expense) {
    return null;
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-900"
        >
          ← 返回
        </button>
        <h1 className="text-xl font-semibold">支出詳情</h1>
        <div className="w-12"></div>
      </div>

      {/* Amount Card */}
      <Card className="mb-4 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="text-sm opacity-90 mb-1">支出金額</div>
        <div className="text-4xl font-bold mb-2">{formatCurrency(expense.amount)}</div>
        <div className="text-sm opacity-90">{formatDateTime(expense.timestamp)}</div>
      </Card>

      {/* Details */}
      <div className="space-y-4 mb-6">
        <Card>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500 mb-1">類別</div>
              <div className="text-base font-medium">{expense.category}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">支付方式</div>
              <div className="text-base font-medium">{expense.paymentMethod}</div>
            </div>
            {expense.description && (
              <div>
                <div className="text-sm text-gray-500 mb-1">備註</div>
                <div className="text-base">{expense.description}</div>
              </div>
            )}
          </div>
        </Card>

        {/* Location */}
        {expense.location && (
          <Card>
            <div className="text-sm text-gray-500 mb-2">位置資訊</div>
            <p className="text-base mb-2">
              {expense.location.address || `${expense.location.latitude.toFixed(6)}, ${expense.location.longitude.toFixed(6)}`}
            </p>
            <a
              href={expense.location.googleMapsUrl || generateGoogleMapsUrl(expense.location.latitude, expense.location.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 text-sm hover:underline inline-flex items-center gap-1"
            >
              在 Google Maps 中查看 →
            </a>
          </Card>
        )}

        {/* Photos */}
        {expense.photos && expense.photos.length > 0 && (
          <Card>
            <div className="text-sm text-gray-500 mb-3">照片記錄</div>
            <div className="grid grid-cols-2 gap-2">
              {expense.photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.data}
                  alt="收據"
                  className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(photo.data, '_blank')}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Split Info */}
        {expense.splitInfo && (
          <>
            <SplitSummary splitInfo={expense.splitInfo} />

            {/* Settlement Actions */}
            <Card>
              <div className="text-sm font-medium text-gray-700 mb-3">結算管理</div>
              <div className="space-y-2">
                {expense.splitInfo.splits
                  .filter((split) => split.participantId !== expense.splitInfo?.paidBy)
                  .map((split: Split) => {
                    const participant = expense.splitInfo?.participants.find((p: Participant) => p.id === split.participantId);
                    return (
                      <div
                        key={split.participantId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{participant?.name}</div>
                          <div className="text-sm text-gray-600">{formatCurrency(split.amount)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleSettled(split.participantId, split.settled)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            split.settled
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {split.settled ? '✓ 已結算' : '標記已還款'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          fullWidth
          onClick={() => navigate(`/add?edit=${expense.id}`)}
        >
          編輯
        </Button>
        <Button
          variant="danger"
          fullWidth
          onClick={handleDelete}
        >
          刪除
        </Button>
      </div>
    </div>
  );
};

export default ExpenseDetail;
