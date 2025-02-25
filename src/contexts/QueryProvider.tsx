import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ui/lazy-load";

// Create a client with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 404s or specific error codes
        if (error?.response?.status === 404) return false;
        // Only retry 3 times
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * A provider for React Query with proper error handling and optimized defaults
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Fallback UI for query errors
  const fallbackRender = (error: Error) => {
    return (
      <div className="p-4 text-center">
        <div className="p-6 rounded-xl bg-black/50 backdrop-blur-md border border-white/5 w-full max-w-md mx-auto">
          <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
          <p className="text-white/70 mb-4">
            {error.message || "There was an error loading this section"}
          </p>
          <button 
            className="px-4 py-2 bg-[#00B2A9] hover:bg-[#00a099] rounded-lg text-white font-medium"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary fallback={fallbackRender}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

/**
 * Custom hook for handling API error responses
 */
export function useErrorHandler() {
  return {
    handleError: (error: any) => {
      console.error("API Error:", error);
      
      // You can use this in components to handle errors from React Query
      const message = error?.response?.data?.message || 
                      error?.message || 
                      "An unexpected error occurred";
                      
      return message;
    }
  };
}

export { queryClient };