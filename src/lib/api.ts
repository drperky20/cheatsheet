import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Base API client with fetch
 */
export const apiClient = {
  // Base fetch function with additional options
  async fetch<T>(
    url: string, 
    options?: RequestInit & { signal?: AbortSignal }
  ): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  },

  // GET request
  get<T>(url: string, options?: RequestInit & { signal?: AbortSignal }): Promise<T> {
    return this.fetch(url, { ...options, method: 'GET' }) as Promise<T>;
  },

  // POST request
  post<T>(url: string, data: any, options?: RequestInit & { signal?: AbortSignal }): Promise<T> {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<T>;
  },

  // PUT request
  put<T>(url: string, data: any, options?: RequestInit & { signal?: AbortSignal }): Promise<T> {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }) as Promise<T>;
  },

  // PATCH request
  patch<T>(url: string, data: any, options?: RequestInit & { signal?: AbortSignal }): Promise<T> {
    return this.fetch(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }) as Promise<T>;
  },

  // DELETE request
  delete<T>(url: string, options?: RequestInit & { signal?: AbortSignal }): Promise<T> {
    return this.fetch(url, {
      ...options,
      method: 'DELETE',
    }) as Promise<T>;
  },
};

/**
 * Custom hook for using cancelable queries
 */
export function useCancelableQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
>(
  queryKey: readonly unknown[],
  queryFn: (signal: AbortSignal) => Promise<TQueryFnData>,
  options?: Omit<UseQueryOptions<TQueryFnData, TError, TData, readonly unknown[]>, 'queryKey' | 'queryFn'>
) {
  const [controller, setController] = useState<AbortController | null>(null);
  
  const result = useQuery({
    queryKey,
    queryFn: ({ signal }) => {
      // Create a new controller for this request
      const newController = new AbortController();
      
      // Combine the signals
      const combinedSignal = new AbortController();
      signal.addEventListener('abort', () => combinedSignal.abort());
      newController.signal.addEventListener('abort', () => combinedSignal.abort());
      
      // Store the controller for external abort
      setController(newController);
      
      return queryFn(combinedSignal.signal);
    },
    ...options
  });

  // Function to cancel the request
  const cancelRequest = () => {
    if (controller) {
      controller.abort();
    }
  };

  return { ...result, cancelRequest };
}

/**
 * Custom hook for using mutations with React Query
 */
export function useApiMutation<TData = unknown, TError = Error, TVariables = unknown, TContext = unknown>(
  mutationKey: readonly unknown[],
  mutationFn: (data: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationKey' | 'mutationFn'>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey,
    mutationFn,
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
      
      // If invalidateQueries is defined in options, invalidate those queries
      if (options?.onSuccess && 'invalidateQueries' in options) {
        const queriesToInvalidate = (options as any).invalidateQueries;
        if (Array.isArray(queriesToInvalidate)) {
          queriesToInvalidate.forEach(query => {
            queryClient.invalidateQueries({ queryKey: query });
          });
        }
      }
    },
    ...options
  });
}