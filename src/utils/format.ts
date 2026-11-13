// Small formatting helpers used across the UI.

// 2450 -> "LKR 2,450.00"
export const formatPrice = (amount: number | undefined | null): string =>
  `LKR ${Number(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (date?: string | Date | null): string =>
  date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

export const formatDateTime = (date?: string | Date | null): string =>
  date
    ? new Date(date).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';

// "OUT_FOR_DELIVERY" -> "Out For Delivery"
export const formatStatus = (status?: string): string =>
  (status || '')
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

// Saves a downloaded file (Blob) to the user's computer
export const saveBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Placeholder when a book has no cover
export const coverOrPlaceholder = (url?: string): string =>
  url && url.trim() ? url : 'https://placehold.co/300x450/e2e8f0/475569?text=BookHaven';

// Returns a readable date "N days from today" (used to show the expected delivery date)
export const addDaysLabel = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};