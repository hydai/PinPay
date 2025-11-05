import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Expense, Location, Photo } from '../types/expense';
import { SplitInfo } from '../types/split';
import { dbHelpers } from '../services/database';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { DEFAULT_PAYMENT_METHODS } from '../constants/paymentMethods';
import { generateId } from '../utils/validation';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { LocationPicker } from '../components/location/LocationPicker';
import { PhotoCapture } from '../components/photo/PhotoCapture';
import { SplitForm } from '../components/split/SplitForm';

const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0].id);
  const [paymentMethod, setPaymentMethod] = useState(DEFAULT_PAYMENT_METHODS[0].id);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<Location | undefined>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [splitInfo, setSplitInfo] = useState<SplitInfo | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      loadExpense(editId);
    }
  }, [editId]);

  const loadExpense = async (id: string) => {
    try {
      const expense = await dbHelpers.getExpense(id);
      if (expense) {
        setAmount(expense.amount.toString());
        setCategory(expense.category);
        setPaymentMethod(expense.paymentMethod);
        setDescription(expense.description || '');
        setLocation(expense.location);
        setPhotos(expense.photos || []);
        setSplitInfo(expense.splitInfo);
      }
    } catch (error) {
      console.error('載入記錄失敗:', error);
      alert('載入失敗');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('請輸入有效的金額');
      return;
    }

    setSaving(true);

    try {
      const categoryName = DEFAULT_CATEGORIES.find(c => c.id === category)?.name || category;
      const paymentMethodName = DEFAULT_PAYMENT_METHODS.find(p => p.id === paymentMethod)?.name || paymentMethod;

      const now = new Date();

      const expense: Expense = {
        id: editId || generateId(),
        amount: amountNum,
        category: categoryName,
        paymentMethod: paymentMethodName,
        description: description.trim() || undefined,
        location,
        photos,
        splitInfo,
        timestamp: now,
        createdAt: now,
        updatedAt: now,
      };

      if (editId) {
        await dbHelpers.updateExpense(editId, expense);
        alert('更新成功！');
      } else {
        await dbHelpers.addExpense(expense);
        alert('記帳成功！');
      }

      navigate('/');
    } catch (error) {
      console.error('儲存失敗:', error);
      alert('儲存失敗，請重試');
    } finally {
      setSaving(false);
    }
  };

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
        <h1 className="text-xl font-semibold">{editId ? '編輯' : '新增'}記帳</h1>
        <div className="w-12"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <Card>
          <Input
            type="number"
            label="金額 *"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            step="0.01"
            min="0"
            icon={<span className="text-gray-500">NT$</span>}
          />
        </Card>

        {/* Category */}
        <Card>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            類別 *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DEFAULT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  category === cat.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-xs font-medium">{cat.name}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Payment Method */}
        <Card>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            支付方式 *
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            {DEFAULT_PAYMENT_METHODS.map((method) => (
              <option key={method.id} value={method.id}>
                {method.icon} {method.name}
              </option>
            ))}
          </select>
        </Card>

        {/* Description */}
        <Card>
          <Input
            type="text"
            label="備註（選填）"
            placeholder="例如：午餐、捷運、買衣服..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Card>

        {/* Location */}
        <Card>
          <LocationPicker location={location} onChange={setLocation} />
        </Card>

        {/* Photos */}
        <Card>
          <PhotoCapture photos={photos} onChange={setPhotos} />
        </Card>

        {/* Split */}
        <Card>
          <SplitForm
            totalAmount={parseFloat(amount) || 0}
            splitInfo={splitInfo}
            onChange={setSplitInfo}
          />
        </Card>

        {/* Submit */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={saving}
          >
            {editId ? '更新記帳' : '完成記帳'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;
