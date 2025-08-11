import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ExchangeRateSource } from '@/models/data/charges/exchange-rate.model';
import { formatDistanceToNow } from 'date-fns';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    Globe,
    RefreshCw,
    Shield,
    Wifi,
    WifiOff,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export interface RateSourceSelectorProps {
  /** Available rate sources */
  sources: ExchangeRateSource[];
  /** Currently selected source */
  selectedSource?: string;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Whether to show detailed source information */
  showDetails?: boolean;
  /** Whether to allow multiple source selection */
  multiSelect?: boolean;
  /** Selected sources (for multi-select mode) */
  selectedSources?: string[];
  /** Callback when source selection changes */
  onSourceChange?: (sourceId: string) => void;
  /** Callback when multiple sources change */
  onSourcesChange?: (sourceIds: string[]) => void;
  /** Callback to refresh sources */
  onRefresh?: () => void;
  /** Callback to toggle source active state */
  onToggleSource?: (sourceId: string, active: boolean) => void;
  /** Additional CSS classes */
  className?: string;
  /** Compact view mode */
  compact?: boolean;
}

interface SourceCardProps {
  source: ExchangeRateSource;
  isSelected: boolean;
  showDetails: boolean;
  onSelect: () => void;
  onToggle?: (active: boolean) => void;
  compact: boolean;
}

const getReliabilityColor = (score: number) => {
  if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

const getReliabilityLabel = (score: number) => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
};

const SourceCard: React.FC<SourceCardProps> = ({
  source,
  isSelected,
  showDetails,
  onSelect,
  onToggle,
  compact,
}) => {
  const reliabilityColor = getReliabilityColor(source.reliability_score);
  const reliabilityLabel = getReliabilityLabel(source.reliability_score);
  const lastUpdated = formatDistanceToNow(new Date(source.last_updated), { addSuffix: true });

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-3 border rounded-md cursor-pointer transition-colors',
          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
        )}
        onClick={onSelect}
      >
        <div className="flex items-center space-x-3">
          <div className={cn(
            'w-3 h-3 rounded-full',
            source.is_active ? 'bg-green-500' : 'bg-gray-300'
          )} />
          <div>
            <p className="font-medium text-sm">{source.name}</p>
            <p className="text-xs text-muted-foreground">{source.base_url}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={cn('text-xs', reliabilityColor)}>
            {source.reliability_score}%
          </Badge>
          {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-primary bg-primary/5'
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center',
              source.is_active ? 'bg-green-500' : 'bg-gray-300'
            )}>
              {source.is_active ? (
                <Wifi className="h-2 w-2 text-white" />
              ) : (
                <WifiOff className="h-2 w-2 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">{source.name}</CardTitle>
              <CardDescription className="text-sm">
                {source.base_url}
              </CardDescription>
            </div>
          </div>
          
          {isSelected && (
            <CheckCircle className="h-5 w-5 text-primary" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reliability Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Reliability</span>
          </div>
          <Badge className={cn('text-xs', reliabilityColor)}>
            {reliabilityLabel} ({source.reliability_score}%)
          </Badge>
        </div>

        {/* Update Frequency */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Updates</span>
          </div>
          <span className="text-sm font-medium">
            Every {source.update_frequency || 60} min
          </span>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last Updated</span>
          </div>
          <span className="text-sm font-medium">
            {lastUpdated}
          </span>
        </div>

        {showDetails && (
          <>
            <Separator />
            
            {/* API Key Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">API Key</span>
              </div>
              <Badge variant={source.api_key ? 'default' : 'destructive'}>
                {source.api_key ? 'Configured' : 'Missing'}
              </Badge>
            </div>

            {/* Rate Limit */}
            {source.rate_limit && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Rate Limit</span>
                </div>
                <span className="text-sm font-medium">
                  {source.rate_limit} req/min
                </span>
              </div>
            )}

            {/* Source Toggle */}
            {onToggle && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label htmlFor={`toggle-${source.ID}`} className="text-sm font-medium">
                    Enable Source
                  </Label>
                  <Switch
                    id={`toggle-${source.ID}`}
                    checked={source.is_active}
                    onCheckedChange={(checked) => onToggle(checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const RateSourceSelector: React.FC<RateSourceSelectorProps> = ({
  sources = [],
  selectedSource,
  loading = false,
  error,
  showDetails = true,
  multiSelect = false,
  selectedSources = [],
  onSourceChange,
  onSourcesChange,
  onRefresh,
  onToggleSource,
  className,
  compact = false,
}) => {
  const [localSelectedSources, setLocalSelectedSources] = useState<string[]>(
    multiSelect ? selectedSources : (selectedSource ? [selectedSource] : [])
  );

  useEffect(() => {
    if (multiSelect) {
      setLocalSelectedSources(selectedSources);
    } else {
      setLocalSelectedSources(selectedSource ? [selectedSource] : []);
    }
  }, [selectedSource, selectedSources, multiSelect]);

  const handleSourceSelect = (sourceId: string) => {
    if (multiSelect) {
      const newSelection = localSelectedSources.includes(sourceId)
        ? localSelectedSources.filter(id => id !== sourceId)
        : [...localSelectedSources, sourceId];
      
      setLocalSelectedSources(newSelection);
      onSourcesChange?.(newSelection);
    } else {
      setLocalSelectedSources([sourceId]);
      onSourceChange?.(sourceId);
    }
  };

  const activeSources = sources.filter(source => source.is_active);
  const inactiveSources = sources.filter(source => !source.is_active);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Rate Sources</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading sources...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Rate Sources</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (sources.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Rate Sources</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Sources Available
            </h3>
            <p className="text-muted-foreground mb-4">
              No exchange rate sources have been configured yet.
            </p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // For compact mode, use a select dropdown
  if (compact && !multiSelect) {
    return (
      <div className={cn('space-y-2', className)}>
        <Label className="text-sm font-medium">Exchange Rate Source</Label>
        <Select value={selectedSource} onValueChange={onSourceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a rate source" />
          </SelectTrigger>
          <SelectContent>
            {activeSources.map((source) => (
              <SelectItem key={source.ID} value={source.ID.toString()}>
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full bg-green-500'
                  )} />
                  <span>{source.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {source.reliability_score}%
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Exchange Rate Sources</span>
            </CardTitle>
            <CardDescription>
              {multiSelect 
                ? 'Select multiple sources for rate comparison'
                : 'Choose your preferred exchange rate source'
              }
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {activeSources.length} active
            </Badge>
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Sources */}
        {activeSources.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <h3 className="font-medium text-sm">Active Sources</h3>
            </div>
            
            <div className={cn(
              'space-y-3',
              compact && 'space-y-2'
            )}>
              {activeSources.map((source) => (
                <SourceCard
                  key={source.ID}
                  source={source}
                  isSelected={localSelectedSources.includes(source.ID.toString())}
                  showDetails={showDetails}
                  onSelect={() => handleSourceSelect(source.ID.toString())}
                  onToggle={onToggleSource ? (active) => onToggleSource(source.ID.toString(), active) : undefined}
                  compact={compact}
                />
              ))}
            </div>
          </div>
        )}

        {/* Inactive Sources */}
        {inactiveSources.length > 0 && showDetails && (
          <>
            {activeSources.length > 0 && <Separator />}
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <WifiOff className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm text-muted-foreground">Inactive Sources</h3>
              </div>
              
              <div className={cn(
                'space-y-3',
                compact && 'space-y-2'
              )}>
                {inactiveSources.map((source) => (
                  <SourceCard
                    key={source.ID}
                    source={source}
                    isSelected={false}
                    showDetails={showDetails}
                    onSelect={() => {}} // Disabled for inactive sources
                    onToggle={onToggleSource ? (active) => onToggleSource(source.ID.toString(), active) : undefined}
                    compact={compact}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Selection Summary */}
        {multiSelect && localSelectedSources.length > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Selected Sources: {localSelectedSources.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLocalSelectedSources([]);
                  onSourcesChange?.([]);
                }}
              >
                Clear All
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RateSourceSelector;