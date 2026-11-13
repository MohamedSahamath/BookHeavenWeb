// Customer site footer.
import { Link } from 'react-router-dom';
import { BookOpen, CreditCard, Truck, ShieldCheck } from 'lucide-react';

const Footer = () => (
  <footer className="mt-16 bg-slate-900 text-slate-300">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <p className="flex items-center gap-2 text-lg font-bold text-white">
          <BookOpen className="text-amber-400" /> BookHaven
        </p>
        <p className="mt-2 text-sm text-slate-400">Sri Lanka's online bookstore. Island-wide delivery within 5 days.</p>
      </div>
      <div>
        <p className="mb-2 font-semibold text-white">Shop</p>
        <ul className="space-y-1 text-sm">
          <li><Link to="/books" className="hover:text-white">All books</Link></li>
          <li><Link to="/books?sort=popular" className="hover:text-white">Popular</Link></li>
          <li><Link to="/authors" className="hover:text-white">Authors</Link></li>
        </ul>
      </div>
      <div>
        <p className="mb-2 font-semibold text-white">Account</p>
        <ul className="space-y-1 text-sm">
          <li><Link to="/orders" className="hover:text-white">My orders</Link></li>
          <li><Link to="/complaints" className="hover:text-white">Help & complaints</Link></li>
          <li><Link to="/profile" className="hover:text-white">Profile</Link></li>
        </ul>
      </div>
      <div className="space-y-2 text-sm">
        <p className="flex items-center gap-2"><Truck size={16} className="text-amber-400" /> Delivery in 5 days</p>
        <p className="flex items-center gap-2"><CreditCard size={16} className="text-amber-400" /> Secure card payments</p>
        <p className="flex items-center gap-2"><ShieldCheck size={16} className="text-amber-400" /> Card details never stored</p>
      </div>
    </div>
    <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
      © {new Date().getFullYear()} BookHaven. ITS2020 RAD Coursework Project.
    </div>
  </footer>
);

export default Footer;