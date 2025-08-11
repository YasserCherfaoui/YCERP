import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AlertCircle, Loader2, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import React from 'react';

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Loading text to display */
  text?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to center the spinner */
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  className,
  centered = true,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={cn(
        'flex items-center space-x-2',
        centered && 'justify-center',
        className
      )}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
};

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Loading text to display */
  text?: string;
  /** Additional CSS classes */
  className?: string;
  /** Background opacity */
  opacity?: 'light' | 'medium' | 'heavy';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text = 'Loading...',
  className,
  opacity = 'medium',
}) => {
  if (!visible) return null;

  const opacityClasses = {
    light: 'bg-background/50',
    medium: 'bg-background/75',
    heavy: 'bg-background/90',
  };

  return (
    <div
      className={cn(
        'absolute inset-0 z-50 flex items-center justify-center',
        opacityClasses[opacity],
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-lg font-medium text-foreground">{text}</p>
      </div>
    </div>
  );
};

export interface TableLoadingProps {
  /** Number of rows to show */
  rows?: number;
  /** Number of columns to show */
  columns?: number;
  /** Whether to show the header */
  showHeader?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const TableLoading: React.FC<TableLoadingProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}) => {
  return (
    <div className={cn('w-full', className)}>
      {showHeader && (
        <div className="flex space-x-4 mb-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={cn(
                  'h-10',
                  colIndex === 0 ? 'w-16' : 'flex-1'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export interface CardLoadingProps {
  /** Number of cards to show */
  count?: number;
  /** Card layout - grid or vertical */
  layout?: 'grid' | 'vertical';
  /** Additional CSS classes */
  className?: string;
}

export const CardLoading: React.FC<CardLoadingProps> = ({
  count = 3,
  layout = 'grid',
  className,
}) => {
  return (
    <div
      className={cn(
        layout === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export interface ChargeCardLoadingProps {
  /** Number of charge cards to show */
  count?: number;
  /** Additional CSS classes */
  className?: string;
}

export const ChargeCardLoading: React.FC<ChargeCardLoadingProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              {/* Title and type */}
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-20" />
              </div>
              
              {/* Description */}
              <Skeleton className="h-4 w-full max-w-md" />
              
              {/* Amount and date */}
              <div className="flex items-center space-x-4 mt-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          
          {/* Status bar */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export interface FormLoadingProps {
  /** Number of form fields to show */
  fields?: number;
  /** Whether to show form buttons */
  showButtons?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const FormLoading: React.FC<FormLoadingProps> = ({
  fields = 5,
  showButtons = true,
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      
      {showButtons && (
        <div className="flex space-x-2 pt-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      )}
    </div>
  );
};

export interface DashboardLoadingProps {
  /** Whether to show stats cards */
  showStats?: boolean;
  /** Whether to show charts */
  showCharts?: boolean;
  /** Whether to show recent activity */
  showActivity?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const DashboardLoading: React.FC<DashboardLoadingProps> = ({
  showStats = true,
  showCharts = true,
  showActivity = true,
  className,
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        {showCharts && (
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        {showActivity && (
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export interface PageLoadingProps {
  /** Type of page loading to show */
  type?: 'dashboard' | 'table' | 'form' | 'cards' | 'custom';
  /** Loading text to display */
  text?: string;
  /** Additional CSS classes */
  className?: string;
  /** Custom loading content */
  children?: React.ReactNode;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  type = 'custom',
  text = 'Loading...',
  className,
  children,
}) => {
  if (children) {
    return <div className={cn('animate-pulse', className)}>{children}</div>;
  }

  return (
    <div className={cn('p-6', className)}>
      {/* Page Header */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Content based on type */}
      {type === 'dashboard' && <DashboardLoading />}
      {type === 'table' && <TableLoading />}
      {type === 'form' && <FormLoading />}
      {type === 'cards' && <CardLoading />}
      
      {type === 'custom' && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
};

// Connection status indicator
export interface ConnectionStatusProps {
  /** Connection status */
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  /** Additional message */
  message?: string;
  /** Additional CSS classes */
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  message,
  className,
}) => {
  const statusConfig = {
    connected: {
      icon: Wifi,
      text: 'Connected',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    connecting: {
      icon: RefreshCw,
      text: 'Connecting...',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    disconnected: {
      icon: WifiOff,
      text: 'Disconnected',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
    },
    error: {
      icon: AlertCircle,
      text: 'Connection Error',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center space-x-2 px-3 py-2 rounded-md border text-sm',
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4',
          status === 'connecting' && 'animate-spin'
        )}
      />
      <span className="font-medium">{config.text}</span>
      {message && <span className="text-muted-foreground">- {message}</span>}
    </div>
  );
};

export default {
  LoadingSpinner,
  LoadingOverlay,
  TableLoading,
  CardLoading,
  ChargeCardLoading,
  FormLoading,
  DashboardLoading,
  PageLoading,
  ConnectionStatus,
};