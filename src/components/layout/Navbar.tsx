import { FormEvent, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, Menu, Package, Search, ShoppingCart, User, X, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../redux/slices/authSlice';
import NotificationBell from '../common/NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const itemCount = useAppSelector((s) => s.cart.cart?.itemCount || 0);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/books?search=${encodeURIComponent(search.trim())}`);
    setMenuOpen(false);
  };

  const onLogout = async () => {
    await dispatch(logout());
    setAccountOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium ${isActive ? 'text-blue-900' : 'text-slate-600 hover:text-blue-900'}`;

  const staffDashboard = user?.role === 'ADMIN' ? '/admin' : user?.role === 'MANAGER' ? '/manager' : null;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-900">
          <BookOpen className="text-amber-500" /> BookHaven
        </Link>

        <nav className="ml-4 hidden items-center gap-5 md:flex">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/books" className={linkClass}>
            All Books
          </NavLink>
          <NavLink to="/authors" className={linkClass}>
            Authors
          </NavLink>
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden max-w-md flex-1 md:flex">
          <div className="relative w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author, category or ISBN"
              className="w-full rounded-full border border-slate-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {user?.role === 'CUSTOMER' && <NotificationBell />}

          {(!user || user.role === 'CUSTOMER') && (
            <Link to="/cart" className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label="Cart">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
                <span className="hidden lg:inline">{user.fullName.split(' ')[0]}</span>
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg" onMouseLeave={() => setAccountOpen(false)}>
                  {staffDashboard ? (
                    <Link to={staffDashboard} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                        <Package size={16} /> My Orders
                      </Link>
                      <Link to="/complaints" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setAccountOpen(false)}>
                        <MessageSquare size={16} /> My Complaints
                      </Link>
                    </>
                  )}
                  <button onClick={onLogout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Login
              </Link>
              <Link to="/register" className="rounded-lg bg-blue-900 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800">
                Register
              </Link>
            </div>
          )}

          <button className="rounded p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="space-y-3 border-t border-slate-200 px-4 py-4 md:hidden">
          <form onSubmit={onSearch}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </form>
          <div className="flex flex-col gap-2" onClick={() => setMenuOpen(false)}>
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/books" className={linkClass}>All Books</NavLink>
            <NavLink to="/authors" className={linkClass}>Authors</NavLink>
            {!user && <NavLink to="/login" className={linkClass}>Login</NavLink>}
            {!user && <NavLink to="/register" className={linkClass}>Register</NavLink>}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;