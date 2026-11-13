// Waits until the user stops typing before returning the value (avoids an API call on every key).
import { useEffect, useState } from 'react';

export const useDebounce = <T,>(value: T, delay = 400): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};