import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Expense } from '../types/expense';
import { dbHelpers } from '../services/database';
import { getUnsettledAmount } from '../services/split';
import { Card } from '../components/common/Card';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/dateFormat';

const SplitManagement: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSplitExpenses();
  }, []);

  const loadSplitExpenses = async () => {
    try {
      const allExpenses = await dbHelpers.getAllExpenses();
      // 只顯示有分帳資訊的支出
      const splitExpenses = allExpenses.filter((expense) => expense.splitInfo);
      setExpenses(splitExpenses);
    } catch (error) {
      console.error('載入分帳記錄失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalUnsettled = () => {
    return expenses.reduce((sum, expense) => {
      if (expense.splitInfo) {
        return sum + getUnsettledAmount(expense.splitInfo);
      }
      return sum;
    }, 0);
  };

  const getSettledCount = () => {
    return expenses.filter((expense) => expense.splitInfo?.settled).length;
  };

  const getUnsettledCount = () => {
    return expenses.filter((expense) => !expense.splitInfo?.settled).length;
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

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">分帳管理</h1>
        <p className="text-gray-600">查看和管理所有分帳記錄</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-900">{expenses.length}</div>
          <div className="text-xs text-gray-600 mt-1">總筆數</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">{getUnsettledCount()}</div>
          <div className="text-xs text-gray-600 mt-1">未結清</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{getSettledCount()}</div>
          <div className="text-xs text-gray-600 mt-1">已結清</div>
        </Card>
      </div>

      {/* Unsettled Total */}
      {getTotalUnsettled() > 0 && (
        <Card className="mb-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-red-700 mb-1">待結算總額</div>
              <div className="text-2xl font-bold text-red-900">
                {formatCurrency(getTotalUnsettled())}
              </div>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </Card>
      )}

      {/* Expense List */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">分帳記錄</h2>

        {expenses.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-600 mb-4">還沒有分帳記錄</p>
            <Link
              to="/add"
              className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              開始記帳
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => {
              const splitInfo = expense.splitInfo!;
              const payer = splitInfo.participants.find((p) => p.id === splitInfo.paidBy);
              const unsettledAmount = getUnsettledAmount(splitInfo);

              return (
                <Link key={expense.id} to={`/expense/${expense.id}`}>
                  <Card hover className={splitInfo.settled ? 'opacity-60' : ''}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {expense.category}
                          </span>
                          {splitInfo.settled ? (
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                              已結清
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                              未結清
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>付款人：{payer?.name || '未知'}</div>
                          <div>
                            參與者：{splitInfo.participants.map((p) => p.name).join(', ')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(expense.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </div>
                        {unsettledAmount > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            待結 {formatCurrency(unsettledAmount)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitManagement;
