import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Expense } from '../types/expense';
import { Participant, Split } from '../types/split';
import { dbHelpers } from '../services/database';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
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
          <Card>
            <div className="text-sm text-gray-500 mb-2">分帳資訊</div>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-600">付款人：</span>
                <span className="font-medium">
                  {expense.splitInfo.participants.find((p: Participant) => p.id === expense.splitInfo?.paidBy)?.name || '未知'}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">分帳方式：</span>
                <span className="font-medium">
                  {expense.splitInfo.splitMethod === 'equal' && '平均分攤'}
                  {expense.splitInfo.splitMethod === 'custom' && '自訂金額'}
                  {expense.splitInfo.splitMethod === 'percentage' && '百分比'}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                {expense.splitInfo.splits.map((split: Split) => {
                  const participant = expense.splitInfo?.participants.find((p: Participant) => p.id === split.participantId);
                  return (
                    <div key={split.participantId} className="flex justify-between text-sm py-1">
                      <span>{participant?.name || '未知'}</span>
                      <span className="font-medium">
                        {formatCurrency(split.amount)}
                        {split.settled && <span className="text-green-600 ml-2">✓</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
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
