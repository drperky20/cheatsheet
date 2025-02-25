import { useEffect, useState, useCallback } from "react";

/**
 * Custom hook to debounce a value change by a specified delay
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default: 400ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook to debounce a function by a specified delay
 * @param callback - The callback function to debounce
 * @param delay - The debounce delay in milliseconds (default: 400ms)
 * @returns A debounced version of the callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T, 
  delay = 400
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const id = setTimeout(() => {
        callback(...args);
      }, delay);

      setTimeoutId(id);
    }, 
    [callback, delay, timeoutId]
  );

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedFunction;
}