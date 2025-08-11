import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    Clock,
    FileX,
    Home,
    RefreshCw, Server,
    Shield,
    WifiOff
} from 'lucide-react';
import React from 'react';

export interface ErrorStateProps {
  /** Error type */
  type?: 'general' | 'network' | 'server' | 'notFound' | 'forbidden' | 'validation' | 'timeout';
  /** Error title */
  title?: string;
  /** Error description */
  description?: string;
  /** Additional error details */
  details?: string;
  /** Actions to display */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive';
    icon?: React.ElementType;
  }>;
  /** Whether to show the retry button */
  showRetry?: boolean;
  /** Retry action */
  onRetry?: () => void;
  /** Whether retry is loading */
  retryLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Error variant */
  variant?: 'default' | 'compact' | 'inline' | 'page';
}

const errorTypeConfig = {
  general: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  network: {
    icon: WifiOff,
    title: 'Connection Error',
    description: 'Unable to connect to the server. Please check your internet connection.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  server: {
    icon: Server,
    title: 'Server Error',
    description: 'The server encountered an error. Please try again later.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  notFound: {
    icon: FileX,
    title: 'Not Found',
    description: 'The requested resource could not be found.',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  forbidden: {
    icon: Shield,
    title: 'Access Denied',
    description: 'You do not have permission to access this resource.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  validation: {
    icon: AlertTriangle,
    title: 'Validation Error',
    description: 'Please check your input and try again.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  timeout: {
    icon: Clock,
    title: 'Request Timeout',
    description: 'The request took too long to complete. Please try again.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'general',
  title,
  description,
  details,
  actions = [],
  showRetry = true,
  onRetry,
  retryLoading = false,
  className,
  variant = 'default',
}) => {
  const config = errorTypeConfig[type];
  const Icon = config.icon;

  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  const defaultActions = [];
  
  if (showRetry && onRetry) {
    defaultActions.push({
      label: 'Try Again',
      onClick: onRetry,
      variant: 'default' as const,
      icon: RefreshCw,
    });
  }

  const allActions = [...actions, ...defaultActions];

  const renderContent = () => (
    <>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={cn('p-3 rounded-full', config.bgColor)}>
          <Icon className={cn('h-8 w-8', config.color)} />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{displayTitle}</h3>
          <p className="text-muted-foreground max-w-md">{displayDescription}</p>
          {details && (
            <details className="text-sm text-muted-foreground mt-2">
              <summary className="cursor-pointer hover:text-foreground">
                Show error details
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-md text-left font-mono text-xs">
                {details}
              </div>
            </details>
          )}
        </div>

        {allActions.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {allActions.map((action, index) => {
              const ActionIcon = action.icon;
              const isRetryAction = action.label === 'Try Again';
              const isLoading = isRetryAction && retryLoading;
              
              return (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  onClick={action.onClick}
                  disabled={isLoading}
                >
                  {ActionIcon && (
                    <ActionIcon
                      className={cn(
                        'mr-2 h-4 w-4',
                        isLoading && 'animate-spin'
                      )}
                    />
                  )}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  if (variant === 'inline') {
    return (
      <Alert className={cn('border-l-4', className)}>
        <Icon className="h-4 w-4" />
        <AlertTitle>{displayTitle}</AlertTitle>
        <AlertDescription className="mt-2">
          {displayDescription}
          {allActions.length > 0 && (
            <div className="flex gap-2 mt-3">
              {allActions.map((action, index) => {
                const ActionIcon = action.icon;
                const isRetryAction = action.label === 'Try Again';
                const isLoading = isRetryAction && retryLoading;
                
                return (
                  <Button
                    key={index}
                    size="sm"
                    variant={action.variant || 'outline'}
                    onClick={action.onClick}
                    disabled={isLoading}
                  >
                    {ActionIcon && (
                      <ActionIcon
                        className={cn(
                          'mr-1 h-3 w-3',
                          isLoading && 'animate-spin'
                        )}
                      />
                    )}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('p-4 rounded-lg border', config.bgColor, className)}>
        <div className="flex items-center space-x-3">
          <Icon className={cn('h-5 w-5 flex-shrink-0', config.color)} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{displayTitle}</p>
            <p className="text-sm text-muted-foreground">{displayDescription}</p>
          </div>
          {allActions.length > 0 && (
            <div className="flex gap-2">
              {allActions.slice(0, 2).map((action, index) => {
                const ActionIcon = action.icon;
                const isRetryAction = action.label === 'Try Again';
                const isLoading = isRetryAction && retryLoading;
                
                return (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    onClick={action.onClick}
                    disabled={isLoading}
                  >
                    {ActionIcon && (
                      <ActionIcon
                        className={cn(
                          'h-3 w-3',
                          isLoading && 'animate-spin'
                        )}
                      />
                    )}
                    <span className="sr-only">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className={cn('min-h-[50vh] flex items-center justify-center p-6', className)}>
        <div className="max-w-md w-full">
          {renderContent()}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-8">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export interface FormErrorProps {
  /** Field errors */
  errors?: Record<string, string | string[]>;
  /** General error message */
  generalError?: string;
  /** Additional CSS classes */
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({
  errors = {},
  generalError,
  className,
}) => {
  const hasErrors = Object.keys(errors).length > 0 || generalError;

  if (!hasErrors) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Please fix the following errors:</AlertTitle>
      <AlertDescription className="mt-2">
        {generalError && (
          <div className="mb-2 font-medium">{generalError}</div>
        )}
        {Object.keys(errors).length > 0 && (
          <ul className="space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="text-sm">
                <span className="font-medium capitalize">{field.replace('_', ' ')}:</span>{' '}
                {Array.isArray(error) ? error.join(', ') : error}
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
};

export interface EmptyStateProps {
  /** Icon to display */
  icon?: React.ElementType;
  /** Title of empty state */
  title: string;
  /** Description of empty state */
  description?: string;
  /** Actions to display */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
    icon?: React.ElementType;
  }>;
  /** Additional CSS classes */
  className?: string;
  /** Variant of empty state */
  variant?: 'default' | 'compact';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileX,
  title,
  description,
  actions = [],
  className,
  variant = 'default',
}) => {
  const renderContent = () => (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="p-3 rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-muted-foreground max-w-md">{description}</p>
        )}
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {actions.map((action, index) => {
            const ActionIcon = action.icon;
            
            return (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
              >
                {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                {action.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className={cn('p-6 text-center', className)}>
        <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
        {description && (
          <p className="text-muted-foreground mb-4">{description}</p>
        )}
        {actions.length > 0 && (
          <div className="flex gap-2 justify-center">
            {actions.map((action, index) => {
              const ActionIcon = action.icon;
              
              return (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'default'}
                  onClick={action.onClick}
                >
                  {ActionIcon && <ActionIcon className="mr-2 h-3 w-3" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-8">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export interface NotFoundStateProps {
  /** Resource type that was not found */
  resource?: string;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
  /** Show go back button */
  showGoBack?: boolean;
  /** Go back action */
  onGoBack?: () => void;
  /** Show go home button */
  showGoHome?: boolean;
  /** Go home action */
  onGoHome?: () => void;
  /** Additional actions */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
    icon?: React.ElementType;
  }>;
  /** Additional CSS classes */
  className?: string;
}

export const NotFoundState: React.FC<NotFoundStateProps> = ({
  resource = 'resource',
  title,
  description,
  showGoBack = true,
  onGoBack,
  showGoHome = true,
  onGoHome,
  actions = [],
  className,
}) => {
  const displayTitle = title || `${resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found`;
  const displayDescription = description || `The ${resource} you're looking for doesn't exist or may have been removed.`;

  const defaultActions = [];

  if (showGoBack && onGoBack) {
    defaultActions.push({
      label: 'Go Back',
      onClick: onGoBack,
      variant: 'outline' as const,
      icon: ArrowLeft,
    });
  }

  if (showGoHome && onGoHome) {
    defaultActions.push({
      label: 'Go Home',
      onClick: onGoHome,
      variant: 'default' as const,
      icon: Home,
    });
  }

  return (
    <ErrorState
      type="notFound"
      title={displayTitle}
      description={displayDescription}
      actions={[...actions, ...defaultActions]}
      showRetry={false}
      variant="page"
      className={className}
    />
  );
};

export interface ApiErrorStateProps {
  /** Error object */
  error: any;
  /** Show technical details */
  showDetails?: boolean;
  /** Retry action */
  onRetry?: () => void;
  /** Whether retry is loading */
  retryLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const ApiErrorState: React.FC<ApiErrorStateProps> = ({
  error,
  showDetails = false,
  onRetry,
  retryLoading = false,
  className,
}) => {
  // Determine error type based on status code or error type
  let errorType: ErrorStateProps['type'] = 'general';
  let title = 'Request Failed';
  let description = 'An error occurred while processing your request.';
  let details = '';

  if (error?.response?.status) {
    const status = error.response.status;
    
    if (status >= 500) {
      errorType = 'server';
      title = 'Server Error';
      description = 'The server encountered an error. Please try again later.';
    } else if (status === 404) {
      errorType = 'notFound';
      title = 'Not Found';
      description = 'The requested resource could not be found.';
    } else if (status === 403) {
      errorType = 'forbidden';
      title = 'Access Denied';
      description = 'You do not have permission to access this resource.';
    } else if (status === 400) {
      errorType = 'validation';
      title = 'Bad Request';
      description = 'Please check your input and try again.';
    }
  } else if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
    errorType = 'network';
    title = 'Connection Error';
    description = 'Unable to connect to the server. Please check your internet connection.';
  } else if (error?.code === 'TIMEOUT_ERROR' || error?.message?.includes('timeout')) {
    errorType = 'timeout';
    title = 'Request Timeout';
    description = 'The request took too long to complete. Please try again.';
  }

  // Extract error details
  if (showDetails) {
    if (error?.response?.data?.message) {
      details = error.response.data.message;
    } else if (error?.message) {
      details = error.message;
    } else if (typeof error === 'string') {
      details = error;
    } else {
      details = JSON.stringify(error, null, 2);
    }
  }

  return (
    <ErrorState
      type={errorType}
      title={title}
      description={description}
      details={showDetails ? details : undefined}
      onRetry={onRetry}
      retryLoading={retryLoading}
      className={className}
    />
  );
};

export default {
  ErrorState,
  FormError,
  EmptyState,
  NotFoundState,
  ApiErrorState,
};