import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ExchangeRateSource } from '@/models/data/charges/exchange-rate.model';
import { format } from 'date-fns';
import {
    AlertTriangle,
    BarChart3,
    Calculator,
    CheckCircle,
    Globe,
    Minus,
    RefreshCw,
    Star,
    TrendingDown,
    TrendingUp
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

export interface RateComparisonProps {
  /** Available rate sources */
  sources: ExchangeRateSource[];
  /** Current rates from each source */
  rates: Record<string, number>;
  /** Currency pair being compared */
  currencyPair: string;
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Default amount for comparison */
  defaultAmount?: number;
  /** Callback to refresh rates */
  onRefresh?: () => void;
  /** Callback when amount changes */
  onAmountChange?: (amount: number) => void;
  /** Additional CSS classes */
  className?: string;
  /** Show detailed comparison */
  showDetails?: boolean;
}

interface RateComparisonData {
  source: ExchangeRateSource;
  rate: number;
  convertedAmount: number;
  difference: number;
  differencePercent: number;
  rank: number;
  isBest: boolean;
  isWorst: boolean;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'DZD' ? 'DZD' : currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
};

const getTrendIcon = (difference: number) => {
  if (difference > 0) return TrendingUp;
  if (difference < 0) return TrendingDown;
  return Minus;
};

const getTrendColor = (difference: number, isBest: boolean, isWorst: boolean) => {
  if (isBest) return 'text-green-600';
  if (isWorst) return 'text-red-600';
  if (difference > 0) return 'text-green-600';
  if (difference < 0) return 'text-red-600';
  return 'text-muted-foreground';
};

export const RateComparison: React.FC<RateComparisonProps> = ({
  sources = [],
  rates = {},
  currencyPair,
  loading = false,
  error,
  defaultAmount = 1000,
  onRefresh,
  onAmountChange,
  className,
  showDetails = true,
}) => {
  const [comparisonAmount, setComparisonAmount] = useState(defaultAmount);
  const [sortBy, setSortBy] = useState<'rate' | 'amount' | 'reliability'>('rate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleAmountChange = (amount: number) => {
    setComparisonAmount(amount);
    onAmountChange?.(amount);
  };

  // Process comparison data
  const comparisonData: RateComparisonData[] = useMemo(() => {
    const activeSources = sources.filter(source => 
      source.is_active && rates[source.ID]
    );

    if (activeSources.length === 0) return [];

    const data = activeSources.map(source => {
      const rate = rates[source.ID] || 0;
      const convertedAmount = comparisonAmount * rate;
      return {
        source,
        rate,
        convertedAmount,
        difference: 0, // Will be calculated after sorting
        differencePercent: 0, // Will be calculated after sorting
        rank: 0, // Will be calculated after sorting
        isBest: false,
        isWorst: false,
      };
    });

    // Sort by selected criteria
    const sortedData = [...data].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'rate':
          comparison = a.rate - b.rate;
          break;
        case 'amount':
          comparison = a.convertedAmount - b.convertedAmount;
          break;
        case 'reliability':
          comparison = a.source.reliability_score - b.source.reliability_score;
          break;
        default:
          comparison = a.rate - b.rate;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Calculate differences and ranks
    const bestRate = Math.max(...sortedData.map(d => d.rate));
    const averageRate = sortedData.reduce((sum, d) => sum + d.rate, 0) / sortedData.length;

    const processedData = sortedData.map((item, index) => {
      const difference = item.rate - averageRate;
      const differencePercent = averageRate > 0 ? (difference / averageRate) * 100 : 0;
      
      return {
        ...item,
        difference,
        differencePercent,
        rank: index + 1,
        isBest: item.rate === bestRate,
        isWorst: item.rate === Math.min(...sortedData.map(d => d.rate)),
      };
    });

    return processedData;
  }, [sources, rates, comparisonAmount, sortBy, sortOrder]);

  const bestSource = comparisonData.find(d => d.isBest);
  const worstSource = comparisonData.find(d => d.isWorst);
  const averageRate = comparisonData.length > 0 
    ? comparisonData.reduce((sum, d) => sum + d.rate, 0) / comparisonData.length 
    : 0;

  const RateCard: React.FC<{ data: RateComparisonData }> = ({ data }) => {
    const TrendIcon = getTrendIcon(data.difference);
    const trendColor = getTrendColor(data.difference, data.isBest, data.isWorst);
    
    return (
      <Card className={cn(
        'transition-all duration-200 hover:shadow-md',
        data.isBest && 'ring-2 ring-green-500 bg-green-50',
        data.isWorst && 'ring-2 ring-red-500 bg-red-50'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={cn(
                'w-3 h-3 rounded-full',
                data.source.is_active ? 'bg-green-500' : 'bg-gray-300'
              )} />
              <h3 className="font-medium text-sm">{data.source.name}</h3>
              {data.isBest && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Star className="h-3 w-3 mr-1" />
                  Best
                </Badge>
              )}
              {data.isWorst && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  Worst
                </Badge>
              )}
            </div>
            
            <Badge variant="outline" className="text-xs">
              #{data.rank}
            </Badge>
          </div>

          <div className="space-y-2">
            {/* Rate */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rate</span>
              <span className="font-mono font-medium">
                {data.rate.toFixed(4)}
              </span>
            </div>

            {/* Converted Amount */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-mono font-medium">
                {formatCurrency(data.convertedAmount, currencyPair.split('/')[1])}
              </span>
            </div>

            {/* Difference from Average */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">vs Average</span>
              <div className="flex items-center space-x-1">
                <TrendIcon className={cn('h-3 w-3', trendColor)} />
                <span className={cn('text-sm font-medium', trendColor)}>
                  {data.differencePercent > 0 ? '+' : ''}{data.differencePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {showDetails && (
              <>
                <Separator className="my-2" />
                
                {/* Reliability */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Reliability</span>
                  <Badge variant="outline" className="text-xs">
                    {data.source.reliability_score}%
                  </Badge>
                </div>

                {/* Last Updated */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Updated</span>
                  <span className="text-xs">
                    {format(new Date(data.source.last_updated), 'HH:mm')}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Rate Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading rates...</span>
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
            <BarChart3 className="h-5 w-5" />
            <span>Rate Comparison</span>
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
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (comparisonData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Rate Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No Rates Available
            </h3>
            <p className="text-muted-foreground mb-4">
              No active rate sources with current rates found.
            </p>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Rates
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Rate Comparison - {currencyPair}</span>
            </CardTitle>
            <CardDescription>
              Compare exchange rates across {comparisonData.length} active sources
            </CardDescription>
          </div>
          
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Comparison Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="amount" className="text-sm font-medium">
              Comparison Amount
            </Label>
            <div className="flex items-center space-x-2 mt-1">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                value={comparisonAmount}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                placeholder="Enter amount..."
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">
                {currencyPair.split('/')[0]}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <Label className="text-sm font-medium">Sort By</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rate">Exchange Rate</SelectItem>
                  <SelectItem value="amount">Converted Amount</SelectItem>
                  <SelectItem value="reliability">Reliability Score</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'desc' ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Best Rate</p>
            <p className="font-mono font-bold text-lg text-green-600">
              {bestSource?.rate.toFixed(4) || '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              {bestSource?.source.name}
            </p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Average Rate</p>
            <p className="font-mono font-bold text-lg">
              {averageRate.toFixed(4)}
            </p>
            <p className="text-xs text-muted-foreground">
              {comparisonData.length} sources
            </p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Rate Spread</p>
            <p className="font-mono font-bold text-lg text-blue-600">
              {bestSource && worstSource 
                ? (bestSource.rate - worstSource.rate).toFixed(4)
                : '—'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Difference
            </p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Best Amount</p>
            <p className="font-mono font-bold text-lg text-green-600">
              {bestSource 
                ? formatCurrency(bestSource.convertedAmount, currencyPair.split('/')[1])
                : '—'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              For {comparisonAmount.toLocaleString()} {currencyPair.split('/')[0]}
            </p>
          </div>
        </div>

        {/* Rate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisonData.map((data) => (
            <RateCard key={data.source.ID} data={data} />
          ))}
        </div>

        {/* Recommendations */}
        {bestSource && worstSource && (
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Recommendation:</strong> Use {bestSource.source.name} for the best rate. 
              You would receive {formatCurrency(bestSource.convertedAmount - worstSource.convertedAmount, currencyPair.split('/')[1])} more 
              compared to the worst rate ({worstSource.source.name}).
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RateComparison;