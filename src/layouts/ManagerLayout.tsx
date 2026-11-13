import { Outlet } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Users, Tags, Truck, PackageCheck, Warehouse, ShoppingBag, MapPin, MessageSquare, FileText,
} from 'lucide-react';
import DashboardShell, { SidebarItem } from '../components/layout/Sidebar';

const items: SidebarItem[] = [
  { to: '/manager', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/manager/books', label: 'Books', icon: BookOpen },
  { to: '/manager/authors', label: 'Authors', icon: Users },
  { to: '/manager/categories', label: 'Categories', icon: Tags },
  { to: '/manager/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/manager/suppliers', label: 'Suppliers', icon: Truck },
  { to: '/manager/supplier-orders', label: 'Supplier Deliveries', icon: PackageCheck },
  { to: '/manager/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/manager/deliveries', label: 'Deliveries', icon: MapPin },
  { to: '/manager/complaints', label: 'Complaints', icon: MessageSquare },
  { to: '/manager/reports', label: 'Reports', icon: FileText },
];

const ManagerLayout = () => (
  <DashboardShell title="Manager Panel" items={items}>
    <Outlet />
  </DashboardShell>
);

export default ManagerLayout;