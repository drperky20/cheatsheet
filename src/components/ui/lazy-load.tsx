import React, { Suspense, lazy, ComponentType } from 'react';

interface LoadingProps {
  /**
   * Flag indicating if content is loading
   */
  loading?: boolean;
}

/**
 * Simple loading skeleton component
 */
export const Skeleton = ({
  className = "",
  width = "100%",
  height = "20px",
  count = 1,
}: {
  className?: string;
  width?: string | number;
  height?: string | number;
  count?: number;
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`skeleton ${className}`}
          style={{
            width: typeof width === "number" ? `${width}px` : width,
            height: typeof height === "number" ? `${height}px` : height,
            marginBottom: index < count - 1 ? "0.5rem" : 0,
          }}
        />
      ))}
    </>
  );
};

/**
 * Content skeleton loader with multiple lines
 */
export const ContentSkeleton = () => (
  <div className="w-full p-4">
    <Skeleton height={32} width="50%" className="mb-4" />
    <Skeleton height={16} width="100%" />
    <Skeleton height={16} width="90%" />
    <Skeleton height={16} width="80%" />
  </div>
);

/**
 * Card skeleton loader
 */
export const CardSkeleton = () => (
  <div className="neo-glass rounded-xl p-6 animate-pulse">
    <Skeleton height={24} width="60%" className="mb-4" />
    <Skeleton height={16} width="100%" />
    <Skeleton height={16} width="90%" />
    <Skeleton height={40} className="mt-4" />
  </div>
);

/**
 * A simpler implementation of lazy loading using Suspense
 */
export const LazyLoad: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = <ContentSkeleton /> }) => (
  <Suspense fallback={fallback}>{children}</Suspense>
);

/**
 * Helper function to lazily load a component
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(importFunc);
}

/**
 * Error display component
 */
export const ErrorDisplay: React.FC<{ error: Error | string }> = ({ error }) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="p-4 rounded-lg bg-destructive/20 border border-destructive text-destructive-foreground">
      <h4 className="font-medium mb-1">Error</h4>
      <p className="text-sm opacity-80">{errorMessage}</p>
    </div>
  );
};

/**
 * Custom error boundary for lazy loaded components
 */
interface ErrorBoundaryProps {
  fallback: React.ReactNode | ((error: Error) => React.ReactNode);
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    
    if (hasError && error) {
      const { fallback } = this.props;
      return typeof fallback === 'function' ? fallback(error) : fallback;
    }

    return this.props.children;
  }
}