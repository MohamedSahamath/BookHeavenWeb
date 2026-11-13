import { ReactNode, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, Menu, X, LucideIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../redux/slices/authSlice';
import NotificationBell from '../common/NotificationBell';

export interface SidebarItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface DashboardShellProps {
  title: string;
  items: SidebarItem[];
  children: ReactNode;
  mapNotificationLink?: (link: string) => string;
}

const DashboardShell = ({ title, items, children, mapNotificationLink }: DashboardShellProps) => {
  const [open, setOpen] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const sidebar = (
    <aside className="flex h-full w-64 flex-col bg-slate-900 text-slate-300">
      <Link to="/" className="flex items-center gap-2 px-5 py-5 text-lg font-bold text-white">
        <BookOpen className="text-amber-400" /> BookHaven
      </Link>
      <p className="px-5 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-blue-900 text-white' : 'hover:bg-slate-800 hover:text-white'}`
            }
          >
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <button onClick={onLogout} className="m-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-slate-800">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{sidebar}</div>

      {/* Mobile sidebar (slides in) */}
      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="h-full">{sidebar}</div>
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <button className="rounded p-1 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
          <p className="hidden text-sm text-slate-500 lg:block">{title}</p>
          <div className="flex items-center gap-3">
            <NotificationBell mapLink={mapNotificationLink} />
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{user?.fullName}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardShell;