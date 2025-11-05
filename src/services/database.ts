import Dexie, { Table } from 'dexie';
import { Expense, Category, PaymentMethod } from '../types/expense';
import { Participant } from '../types/split';

export class PinPayDatabase extends Dexie {
  expenses!: Table<Expense>;
  categories!: Table<Category>;
  paymentMethods!: Table<PaymentMethod>;
  participants!: Table<Participant>;

  constructor() {
    super('PinPayDB');

    this.version(1).stores({
      expenses: 'id, timestamp, category, amount, *photos',
      categories: 'id, name',
      paymentMethods: 'id, name',
      participants: 'id, name',
    });
  }
}

export const db = new PinPayDatabase();

// Database helper functions
export const dbHelpers = {
  // Expenses
  async addExpense(expense: Expense): Promise<void> {
    await db.expenses.add(expense);
  },

  async updateExpense(id: string, changes: Partial<Expense>): Promise<number> {
    return await db.expenses.update(id, {
      ...changes,
      updatedAt: new Date(),
    });
  },

  async deleteExpense(id: string): Promise<void> {
    await db.expenses.delete(id);
  },

  async getExpense(id: string): Promise<Expense | undefined> {
    return await db.expenses.get(id);
  },

  async getAllExpenses(): Promise<Expense[]> {
    return await db.expenses.orderBy('timestamp').reverse().toArray();
  },

  async getExpensesByDateRange(start: Date, end: Date): Promise<Expense[]> {
    return await db.expenses
      .where('timestamp')
      .between(start, end)
      .reverse()
      .toArray();
  },

  async getExpensesByCategory(category: string): Promise<Expense[]> {
    return await db.expenses
      .where('category')
      .equals(category)
      .reverse()
      .toArray();
  },

  // Categories
  async addCategory(category: Category): Promise<void> {
    await db.categories.add(category);
  },

  async updateCategory(id: string, changes: Partial<Category>): Promise<number> {
    return await db.categories.update(id, changes);
  },

  async deleteCategory(id: string): Promise<void> {
    await db.categories.delete(id);
  },

  async getAllCategories(): Promise<Category[]> {
    return await db.categories.toArray();
  },

  // Payment Methods
  async addPaymentMethod(method: PaymentMethod): Promise<void> {
    await db.paymentMethods.add(method);
  },

  async updatePaymentMethod(id: string, changes: Partial<PaymentMethod>): Promise<number> {
    return await db.paymentMethods.update(id, changes);
  },

  async deletePaymentMethod(id: string): Promise<void> {
    await db.paymentMethods.delete(id);
  },

  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    return await db.paymentMethods.toArray();
  },

  // Participants
  async addParticipant(participant: Participant): Promise<void> {
    await db.participants.add(participant);
  },

  async updateParticipant(id: string, changes: Partial<Participant>): Promise<number> {
    return await db.participants.update(id, changes);
  },

  async deleteParticipant(id: string): Promise<void> {
    await db.participants.delete(id);
  },

  async getAllParticipants(): Promise<Participant[]> {
    return await db.participants.toArray();
  },

  // Statistics
  async getTotalExpenses(): Promise<number> {
    const expenses = await db.expenses.toArray();
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  },

  async getExpensesByMonthYear(month: number, year: number): Promise<Expense[]> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    return await this.getExpensesByDateRange(start, end);
  },

  async getCategoryStats(): Promise<{ category: string; total: number; count: number }[]> {
    const expenses = await db.expenses.toArray();
    const stats = new Map<string, { total: number; count: number }>();

    expenses.forEach((expense) => {
      const current = stats.get(expense.category) || { total: 0, count: 0 };
      stats.set(expense.category, {
        total: current.total + expense.amount,
        count: current.count + 1,
      });
    });

    return Array.from(stats.entries()).map(([category, data]) => ({
      category,
      ...data,
    }));
  },
};
