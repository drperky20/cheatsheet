import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * React Query provider with optimized settings
 * - Default stale time of 5 minutes (reduces unnecessary refetching)
 * - Cache time of 10 minutes
 * - Retry failed requests up to 1 time
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1, // Retry failed requests only once
        refetchOnWindowFocus: false, // Don't refetch on window focus by default
      }
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}