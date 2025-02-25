import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// Debounce function for search inputs and other frequent user actions
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Throttle function to limit execution frequency
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
) {
  const lastRan = useRef(Date.now());
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      }
    },
    [callback, delay]
  );
}

// Cache expensive function results with custom key
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList,
  cacheKey?: string
): T {
  // Use the deps array to create a stable key
  const key = cacheKey || JSON.stringify(deps);
  
  // Memoize the function result
  return useMemo(() => {
    return factory();
  }, [key]);
}

// For cancelable API requests
export function useCancelableRequest() {
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const createRequest = useCallback(<T>(
    requestFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T> => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    
    // Make the request with the signal
    try {
      return requestFn(signal);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request was canceled');
      }
      throw error;
    }
  }, []);
  
  // Cancel all pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return { createRequest };
}

// Lazy loading of components with loading state
export function useLazyLoad<T>(
  loader: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    loader()
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, dependencies);
  
  return { loading, error, data };
}

// Handle loading states with different delay thresholds to avoid UI flicker
export function useLoadingState(isLoading: boolean, delay: number = 300) {
  const [showLoading, setShowLoading] = useState(false);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isLoading) {
      timeout = setTimeout(() => {
        setShowLoading(true);
      }, delay);
    } else {
      setShowLoading(false);
    }
    
    return () => {
      clearTimeout(timeout);
    };
  }, [isLoading, delay]);
  
  return showLoading;
}