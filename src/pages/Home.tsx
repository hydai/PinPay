import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Expense } from '../types/expense';
import { dbHelpers } from '../services/database';
import { Card } from '../components/common/Card';
import { formatCurrency } from '../utils/currency';
import { formatRelativeTime } from '../utils/dateFormat';

const Home: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await dbHelpers.getAllExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('載入支出記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

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

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PinPay</h1>
        <p className="text-gray-600">位置記帳助手</p>
      </div>

      {/* Summary Card */}
      <Card className="mb-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="text-sm opacity-90 mb-1">總支出</div>
        <div className="text-3xl font-bold">{formatCurrency(totalAmount)}</div>
        <div className="text-sm opacity-90 mt-2">
          共 {expenses.length} 筆記錄
        </div>
      </Card>

      {/* Recent Expenses */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-900">最近記錄</h2>
          {expenses.length > 0 && (
            <Link to="/statistics" className="text-primary-600 text-sm hover:underline">
              查看全部
            </Link>
          )}
        </div>

        {expenses.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600 mb-4">還沒有任何記錄</p>
            <Link
              to="/add"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              開始記帳
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {expenses.slice(0, 10).map((expense) => (
              <Link key={expense.id} to={`/expense/${expense.id}`}>
                <Card hover>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {expense.category === '餐飲' && '🍽️'}
                          {expense.category === '交通' && '🚗'}
                          {expense.category === '購物' && '🛍️'}
                          {expense.category === '娛樂' && '🎬'}
                          {expense.category === '住宿' && '🏨'}
                          {expense.category === '其他' && '📌'}
                        </span>
                        <span className="font-medium text-gray-900">
                          {expense.category}
                        </span>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-600 mb-1">
                          {expense.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatRelativeTime(expense.timestamp)}</span>
                        {expense.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              📍 {expense.location.placeName || expense.location.address || '已定位'}
                            </span>
                          </>
                        )}
                        {expense.splitInfo && (
                          <>
                            <span>•</span>
                            <span>👥 分帳</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {expense.paymentMethod}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
