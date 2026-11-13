// Loading indicators.
export const Spinner = ({ size = 32 }: { size?: number }) => (
  <span
    className="inline-block animate-spin rounded-full border-4 border-blue-900 border-t-transparent"
    style={{ width: size, height: size }}
    role="status"
    aria-label="Loading"
  />
);

const Loader = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
    <Spinner />
    <p className="text-sm">{text}</p>
  </div>
);

export default Loader;