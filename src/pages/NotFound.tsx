import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <p className="text-6xl font-bold text-blue-900">404</p>
    <h1 className="mt-2 text-xl font-semibold text-slate-800">Page not found</h1>
    <p className="mt-1 text-sm text-slate-500">The page you are looking for does not exist.</p>
    <Link to="/" className="mt-6 rounded-lg bg-blue-900 px-4 py-2 text-sm text-white">Go to homepage</Link>
  </div>
);

export default NotFound;