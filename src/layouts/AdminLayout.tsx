import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard, UserCog, Users, BarChart3, Receipt, CreditCard, FileText, BookOpen, Warehouse, Truck,
  ShoppingBag, MessageSquare, PackageCheck, Tags,
} from 'lucide-react';
import DashboardShell, { SidebarItem } from '../components/layout/Sidebar';

const items: SidebarItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/finance', label: 'Finance & Analytics', icon: BarChart3 },
  { to: '/admin/expenses', label: 'Expenses', icon: Receipt },
  { to: '/admin/transactions', label: 'Transactions', icon: CreditCard },
  { to: '/admin/reports', label: 'Reports', icon: FileText },
  { to: '/admin/managers', label: 'Managers', icon: UserCog },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/books', label: 'Books', icon: BookOpen },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/admin/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/admin/supplier-orders', label: 'Supplier Deliveries', icon: PackageCheck },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/complaints', label: 'Complaints', icon: MessageSquare },
];

const AdminLayout = () => (
  <DashboardShell
    title="Admin Panel"
    items={items}
    mapNotificationLink={(link) => link.replace(/^\/manager/, '/admin')}
  >
    <Outlet />
  </DashboardShell>
);

export default AdminLayout;