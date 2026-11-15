import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  BookOpen, CheckCircle2, Clock, DollarSign, MessageSquare, Receipt, ShoppingBag, TrendingUp, Truck, UserCog, Users, PackageCheck,
} from 'lucide-react';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { AdminDashboard as DashboardData, User } from '../../types';
import { formatDate, formatPrice } from '../../utils/format';
import StatCard from '../../components/dashboard/StatCard';
import ChartCard from '../../components/dashboard/ChartCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getDashboard().then(setData).catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <EmptyState title="Could not load dashboard" message={error} />;
  if (!data) return <Loader />;

  const monthName = new Date().toLocaleString('en-GB', { month: 'long' });

  return (
    <div>
      <PageHeader title="Business overview" description={`Financial figures for ${monthName} ${new Date().getFullYear()}`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={`Revenue (${monthName})`} value={formatPrice(data.monthlyRevenue)} icon={DollarSign} color="green" />
        <StatCard label={`Expenses (${monthName})`} value={formatPrice(data.monthlyExpenses)} icon={Receipt} color="red" />
        <StatCard label={`Profit (${monthName})`} value={formatPrice(data.monthlyProfit)} icon={TrendingUp} color={data.monthlyProfit >= 0 ? 'blue' : 'red'} />
        <StatCard label="Total supplier payments" value={formatPrice(data.totalSupplierPayments)} icon={PackageCheck} color="purple" />
        <StatCard label="Registered customers" value={data.totalCustomers} icon={Users} />
        <StatCard label="Managers" value={data.totalManagers} icon={UserCog} color="slate" />
        <StatCard label="Available books" value={data.totalBooks} icon={BookOpen} color="purple" />
        <StatCard label="Books sold" value={data.totalBooksSold} icon={ShoppingBag} color="green" />
        <StatCard label="Total orders" value={data.totalOrders} icon={Truck} />
        <StatCard label="Pending orders" value={data.pendingOrders} icon={Clock} color="amber" />
        <StatCard label="Delivered orders" value={data.deliveredOrders} icon={CheckCircle2} color="green" />
        <StatCard label="Pending complaints" value={data.pendingComplaints} icon={MessageSquare} color="red" />
      </div>

      <div className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <div><p className="text-xs uppercase text-slate-500">Revenue this year</p><p className="text-xl font-bold text-emerald-700">{formatPrice(data.yearRevenue)}</p></div>
        <div><p className="text-xs uppercase text-slate-500">Expenses this year</p><p className="text-xl font-bold text-red-700">{formatPrice(data.yearExpenses)}</p></div>
        <div><p className="text-xs uppercase text-slate-500">Profit this year</p><p className="text-xl font-bold text-blue-900">{formatPrice(data.yearProfit)}</p></div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <ChartCard title="Monthly revenue vs expenses" action={<Link to="/admin/finance" className="text-sm text-blue-800">Full analytics →</Link>}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v) => formatPrice(Number(v))} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 font-semibold text-slate-800">Recent orders</h3>
          <ul className="divide-y text-sm">
            {data.recentOrders.map((o) => (
              <li key={o._id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-slate-500">{typeof o.customer === 'string' ? '' : (o.customer as Pick<User, 'fullName'>).fullName} · {formatDate(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p>{formatPrice(o.totalAmount)}</p>
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
            {data.recentOrders.length === 0 && <p className="text-slate-500">No orders yet</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;