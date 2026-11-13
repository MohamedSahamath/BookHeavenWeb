import { FormEvent, useState } from 'react';
import { Complaint } from '../../types';
import { formatDateTime, formatStatus } from '../../utils/format';
import StatusBadge from './StatusBadge';
import Button from './Button';

interface ComplaintThreadProps {
  complaint: Complaint;
  onReply: (message: string) => Promise<void>;
}

const ComplaintThread = ({ complaint, onReply }: ComplaintThreadProps) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const closed = complaint.status === 'RESOLVED' || complaint.status === 'REJECTED';

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await onReply(message.trim());
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <StatusBadge status={complaint.status} />
        <span>{formatStatus(complaint.type)}</span>·<span>Order {complaint.order?.orderNumber}</span>·<span>{formatDateTime(complaint.createdAt)}</span>
      </div>

      <div className="rounded-lg bg-slate-50 p-4">
        <p className="font-semibold text-slate-900">{complaint.subject}</p>
        <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{complaint.description}</p>
      </div>

      <div className="space-y-3">
        {complaint.responses.map((r, i) => {
          const isCustomer = r.responderRole === 'CUSTOMER';
          const name = typeof r.responder === 'string' ? r.responderRole : r.responder.fullName;
          return (
            <div key={i} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${isCustomer ? 'bg-blue-900 text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
                <p className={`text-xs ${isCustomer ? 'text-blue-200' : 'text-slate-500'}`}>
                  {isCustomer ? name : `${name} (BookHaven ${formatStatus(r.responderRole)})`} · {formatDateTime(r.createdAt)}
                </p>
                <p className="mt-1 whitespace-pre-line">{r.message}</p>
              </div>
            </div>
          );
        })}
        {complaint.responses.length === 0 && <p className="text-center text-sm text-slate-400">No replies yet.</p>}
      </div>

      {closed ? (
        <p className="rounded-lg bg-slate-100 px-4 py-3 text-center text-sm text-slate-600">This complaint is {complaint.status.toLowerCase()}.</p>
      ) : (
        <form onSubmit={submit} className="flex gap-2">
          <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a reply..." className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          <Button type="submit" loading={sending}>Send</Button>
        </form>
      )}

      {complaint.statusHistory.length > 0 && (
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer">Status history</summary>
          <ul className="mt-2 space-y-1">
            {complaint.statusHistory.map((h, i) => (
              <li key={i}>{formatDateTime(h.changedAt)} — {formatStatus(h.status)}{h.note ? `: ${h.note}` : ''}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};

export default ComplaintThread;