import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const AuthCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 px-4 py-10">
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
      <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-blue-900">
        <BookOpen className="text-amber-500" /> BookHaven
      </Link>
      <h1 className="text-center text-xl font-semibold text-slate-900">{title}</h1>
      {subtitle && <p className="mt-1 text-center text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  </div>
);

export default AuthCard;