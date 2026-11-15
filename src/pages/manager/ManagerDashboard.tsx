import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, BookOpen, Boxes, CheckCircle2, Clock, MessageSquare, PackageCheck, PackageX, ShoppingBag, Truck, Timer, Loader as LoaderIcon,
} from 'lucide-react';
import managerService from '../../services/managerService';
import { getErrorMessage } from '../../services/api';
import { ManagerDashboard as DashboardData } from '../../types';
import { useAppSelector } from '../../hooks/useRedux';
import StatCard from '../../components/dashboard/StatCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const ManagerDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const role = useAppSelector((s) => s.auth.user?.role);
  const base = role === 'ADMIN' ? '/admin' : '/manager';

  useEffect(() => {
    managerService.getDashboard().then(setData).catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <EmptyState title="Could not load dashboard" message={error} />;
  if (!data) return <Loader />;

  return (
    <div>
      <PageHeader title="Operations dashboard" description="Books, stock, orders, deliveries and complaints at a glance" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total books" value={data.totalBooks} icon={BookOpen} />
        <StatCard label="Available stock (copies)" value={data.availableStock} icon={Boxes} color="green" />
        <StatCard label="Low-stock books" value={data.lowStockBooks} icon={AlertTriangle} color="amber" />
        <StatCard label="Out-of-stock books" value={data.outOfStockBooks} icon={PackageX} color="red" />
        <StatCard label="Total orders" value={data.totalOrders} icon={ShoppingBag} color="purple" />
        <StatCard label="Pending orders" value={data.pendingOrders} icon={Clock} color="amber" hint="Confirmed, not yet processed" />
        <StatCard label="Processing" value={data.processingOrders} icon={LoaderIcon} color="blue" />
        <StatCard label="Dispatched" value={data.dispatchedOrders} icon={Truck} color="purple" />
        <StatCard label="Delivered" value={data.deliveredOrders} icon={CheckCircle2} color="green" />
        <StatCard label="Delayed deliveries" value={data.delayedDeliveries} icon={Timer} color="red" hint="Past the 5-day date" />
        <StatCard label="Pending supplier deliveries" value={data.pendingSupplierDeliveries} icon={PackageCheck} color="amber" hint={`${data.overdueSupplierDeliveries} overdue`} />
        <StatCard label="Received supplier deliveries" value={data.receivedSupplierDeliveries} icon={PackageCheck} color="green" />
        <StatCard label="Open complaints" value={data.openComplaints} icon={MessageSquare} color="red" />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Low-stock notifications</h2>
          <Link to={`${base}/inventory`} className="text-sm text-blue-800 hover:underline">Manage inventory →</Link>
        </div>
        {data.lowStockList.length === 0 ? (
          <p className="text-sm text-slate-500">All books have healthy stock levels.</p>
        ) : (
          <ul className="divide-y text-sm">
            {data.lowStockList.map((i) => (
              <li key={i._id} className="flex items-center justify-between py-2">
                <span>{i.book?.title}</span>
                <span className="flex items-center gap-3">
                  <span className="text-slate-500">{i.quantity} left (warning at {i.lowStockLevel})</span>
                  <StatusBadge status={i.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;