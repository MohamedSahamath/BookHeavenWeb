import { useEffect, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { Analytics, MonthlyRow } from '../../types';
import { formatPrice, formatStatus } from '../../utils/format';
import ChartCard from '../../components/dashboard/ChartCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';

const COLORS = ['#1e3a8a', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];
const money = (v: unknown) => formatPrice(Number(v));

const Finance = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [data, setData] = useState<Analytics | null>(null);
  const [profit, setProfit] = useState<MonthlyRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    adminService.getAnalytics(year).then(setData).catch((err) => setError(getErrorMessage(err)));
  }, [year]);

  useEffect(() => {
    adminService.getProfitReport(period, year).then(setProfit).catch(() => setProfit([]));
  }, [period, year]);

  if (error) return <EmptyState title="Could not load analytics" message={error} />;

  const inventoryPie = data
    ? [
        { name: 'In stock', value: data.inventory.inStock },
        { name: 'Low stock', value: data.inventory.lowStock },
        { name: 'Out of stock', value: data.inventory.outOfStock },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Finance & analytics"
        description="Profit = Revenue (paid orders) − Expenses (supplier payments + business expenses)"
        actions={
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            {[0, 1, 2, 3].map((n) => {
              const y = new Date().getFullYear() - n;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        }
      />

      {!data ? (
        <Loader />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard title="Monthly revenue, expenses & profit">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={money} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#1e3a8a" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Monthly order counts">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="orders" name="Paid orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="booksSold" name="Books sold" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Best-selling books (copies)">
              {data.bestSellers.length === 0 ? (
                <p className="text-sm text-slate-500">No sales yet</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.bestSellers} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} fontSize={12} />
                    <YAxis type="category" dataKey="title" width={140} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="quantity" name="Copies sold" fill="#1e3a8a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Sales by category (revenue)">
              {data.salesByCategory.length === 0 ? (
                <p className="text-sm text-slate-500">No sales yet</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.salesByCategory} dataKey="revenue" nameKey="category" outerRadius={100} label>
                      {data.salesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={money} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Inventory overview (books)">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={inventoryPie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label>
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={`Expenses by category (${year})`}>
              {data.expenseBreakdown.length === 0 ? (
                <p className="text-sm text-slate-500">No expenses recorded</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.expenseBreakdown.map((e) => ({ name: formatStatus(e._id), total: e.total }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={money} />
                    <Bar dataKey="total" name="Amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Profit table */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-slate-800">Profit report</h3>
              <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                {(['monthly', 'quarterly', 'yearly'] as const).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)} className={`rounded-md px-3 py-1 text-sm capitalize ${period === p ? 'bg-white shadow' : ''}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr><th className="px-3 py-2 text-left">Period</th><th className="px-3 py-2 text-right">Orders</th><th className="px-3 py-2 text-right">Revenue</th><th className="px-3 py-2 text-right">Expenses</th><th className="px-3 py-2 text-right">Profit</th></tr>
                </thead>
                <tbody className="divide-y">
                  {profit.map((row) => (
                    <tr key={row.label}>
                      <td className="px-3 py-2">{row.label}</td>
                      <td className="px-3 py-2 text-right">{row.orders}</td>
                      <td className="px-3 py-2 text-right">{formatPrice(row.revenue)}</td>
                      <td className="px-3 py-2 text-right">{formatPrice(row.expenses)}</td>
                      <td className={`px-3 py-2 text-right font-semibold ${row.profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatPrice(row.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;