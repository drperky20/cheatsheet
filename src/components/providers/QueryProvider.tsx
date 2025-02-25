import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface QueryProviderProps {
  children: React.ReactNode;
}

const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const { toast } = useToast();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
    queryCache: new QueryCache({
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error?.message || 'An unexpected error occurred',
          variant: 'destructive',
          className: 'bg-white/10 backdrop-blur-lg border border-white/20',
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error?.message || 'An unexpected error occurred',
          variant: 'destructive',
          className: 'bg-white/10 backdrop-blur-lg border border-white/20',
        });
      },
    }),
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default QueryProvider;