import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchUnreadCount, unreadCountSet } from '../../redux/slices/notificationSlice';
import notificationService from '../../services/notificationService';
import { AppNotification } from '../../types';
import { formatDateTime } from '../../utils/format';

// mapLink lets the Admin layout turn "/manager/..." links into "/admin/..." links
const NotificationBell = ({ mapLink }: { mapLink?: (link: string) => string }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchUnreadCount());
    const timer = setInterval(() => dispatch(fetchUnreadCount()), 30000);
    return () => clearInterval(timer);
  }, [dispatch]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      const data = await notificationService.getNotifications(1, 8);
      setItems(data.notifications);
      dispatch(unreadCountSet(data.unreadCount));
    }
  };

  const openNotification = async (n: AppNotification) => {
    if (!n.isRead) {
      await notificationService.markAsRead(n._id);
      dispatch(fetchUnreadCount());
    }
    setOpen(false);
    if (n.link) navigate(mapLink ? mapLink(n.link) : n.link);
  };

  const markAll = async () => {
    await notificationService.markAllAsRead();
    setItems((list) => list.map((n) => ({ ...n, isRead: true })));
    dispatch(unreadCountSet(0));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifications">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAll} className="text-xs text-blue-700 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications yet</p>}
            {items.map((n) => (
              <button
                key={n._id}
                onClick={() => openNotification(n)}
                className={`block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${n.isRead ? '' : 'bg-blue-50'}`}
              >
                <p className="text-sm font-medium text-slate-900">{n.title}</p>
                <p className="text-xs text-slate-600">{n.message}</p>
                <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(n.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;