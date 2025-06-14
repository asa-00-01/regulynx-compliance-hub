
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingWrapperProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

const LoadingWrapper = ({ isLoading, children, className = "" }: LoadingWrapperProps) => {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;
