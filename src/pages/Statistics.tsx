import React, { useEffect, useState } from 'react';
import { Expense } from '../types/expense';
import { dbHelpers } from '../services/database';
import { Card } from '../components/common/Card';
import { BarChart } from '../components/charts/BarChart';
import { PieChart } from '../components/charts/PieChart';
import { LineChart } from '../components/charts/LineChart';
import {
  calculateDailyStats,
  calculateCategoryStats,
  calculateMonthlyStats,
  calculatePaymentMethodStats,
  calculateSummary,
} from '../utils/statistics';
import { formatCurrency } from '../utils/currency';

const Statistics: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');

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

  // 根據時間範圍篩選
  const getFilteredExpenses = () => {
    if (timeRange === 'all') return expenses;

    const now = new Date();
    const cutoffDate = new Date();

    if (timeRange === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      cutoffDate.setMonth(now.getMonth() - 1);
    }

    return expenses.filter((expense) => new Date(expense.timestamp) >= cutoffDate);
  };

  const filteredExpenses = getFilteredExpenses();
  const summary = calculateSummary(filteredExpenses);
  const categoryStats = calculateCategoryStats(filteredExpenses);
  const monthlyStats = calculateMonthlyStats(expenses, 6);
  const dailyStats = calculateDailyStats(filteredExpenses, timeRange === 'week' ? 7 : 30);
  const paymentStats = calculatePaymentMethodStats(filteredExpenses);

  if (expenses.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">統計分析</h1>
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 mb-4">還沒有支出記錄</p>
          <p className="text-sm text-gray-500">開始記帳後就能看到統計資料</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">統計分析</h1>
        <p className="text-gray-600">了解您的消費習慣</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTimeRange('week')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeRange === 'week'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          最近7天
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeRange === 'month'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          最近30天
        </button>
        <button
          onClick={() => setTimeRange('all')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            timeRange === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <div className="text-sm text-gray-600 mb-1">總支出</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.total)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">記錄數</div>
          <div className="text-2xl font-bold text-gray-900">{summary.count}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">平均支出</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.average)}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-600 mb-1">最大單筆</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.maxExpense?.amount || 0)}
          </div>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">本月 vs 上月</h2>
        <p className="text-sm text-gray-600 mb-4">支出比較</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-600">本月</div>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(summary.thisMonthTotal)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">上月</div>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(summary.lastMonthTotal)}
            </div>
          </div>
        </div>

        {summary.lastMonthTotal > 0 && (
          <div className={`text-sm font-medium ${
            summary.monthlyChange > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {summary.monthlyChange > 0 ? '↑' : '↓'}{' '}
            {Math.abs(summary.monthlyChange).toFixed(1)}%
          </div>
        )}
      </Card>

      {/* Daily Trend Chart */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {timeRange === 'week' ? '每日' : '每日'}支出趨勢
        </h2>
        <LineChart
          data={dailyStats.map((stat) => ({
            label: stat.date.slice(5), // MM-DD
            value: stat.total,
          }))}
          height={150}
        />
      </Card>

      {/* Category Distribution */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">類別分布</h2>
        <PieChart
          data={categoryStats.map((stat) => ({
            label: stat.category,
            value: stat.total,
            percentage: stat.percentage,
          }))}
        />
      </Card>

      {/* Category Details */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">各類別明細</h2>
        <div className="space-y-3">
          {categoryStats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{stat.category}</span>
                  <span className="text-xs text-gray-500">({stat.count} 筆)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(stat.total)}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Bar Chart */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">月度趨勢</h2>
        <BarChart
          data={monthlyStats.map((stat) => ({
            label: stat.month.slice(5), // MM
            value: stat.total,
          }))}
          height={180}
        />
      </Card>

      {/* Payment Method Stats */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">支付方式分布</h2>
        <div className="space-y-2">
          {paymentStats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900">{stat.method}</div>
                <div className="text-sm text-gray-600">{stat.count} 筆</div>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(stat.total)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Statistics;
