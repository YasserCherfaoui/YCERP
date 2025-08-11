import { AppDispatch } from '@/app/store';
import { ErrorState } from '@/components/common/error-states';
import { PageLoading } from '@/components/common/loading-states';
import ExchangeCalculator from '@/components/feature-specific/charges/exchange-rates/exchange-calculator';
import ExchangeDashboard from '@/components/feature-specific/charges/exchange-rates/exchange-dashboard';
import { ExchangeForm } from '@/components/feature-specific/charges/exchange-rates/exchange-form';
import ExchangeHistoryChart from '@/components/feature-specific/charges/exchange-rates/exchange-history-chart';
import RateComparison from '@/components/feature-specific/charges/exchange-rates/rate-comparison';
import RateSourceSelector from '@/components/feature-specific/charges/exchange-rates/rate-source-selector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    selectCompanyID,
    selectCurrentRates,
    selectExchangeRateCharges,
    selectExchangeRatesError,
    selectExchangeRatesLoading,
    selectExchangeRatesState,
    selectRateHistory,
    selectRateSources,
    selectSelectedSource,
} from '@/features/charges/exchange-rates-selectors';
import {
    fetchCurrentRates,
    fetchExchangeRateCharges,
    fetchExchangeRateHistory,
    fetchExchangeRateSources,
    setSelectedSource,
} from '@/features/charges/exchange-rates-slice';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
    Activity,
    BarChart3,
    Calculator,
    Clock,
    DollarSign,
    Globe,
    History,
    Plus,
    RefreshCw,
    Settings,
    TrendingUp
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ExchangeRatesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewExchangeDialog, setShowNewExchangeDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Redux selectors
  const exchangeRatesState = useSelector(selectExchangeRatesState);
  const currentRates = useSelector(selectCurrentRates);
  const rateSources = useSelector(selectRateSources);
  const rateHistory = useSelector(selectRateHistory);
  const exchangeCharges = useSelector(selectExchangeRateCharges);
  const loading = useSelector(selectExchangeRatesLoading);
  const error = useSelector(selectExchangeRatesError);
  const selectedSource = useSelector(selectSelectedSource);
  const companyID = useSelector(selectCompanyID);

  // Initialize data on component mount
  useEffect(() => {
    if (!companyID) return;

    const initializeData = async () => {
      try {
        await Promise.all([
          dispatch(fetchCurrentRates(["EUR/DZD", "USD/DZD"])).unwrap(),
          dispatch(fetchExchangeRateSources()).unwrap(),
          dispatch(fetchExchangeRateHistory({ 
            source: 'EUR',
            target: 'DZD',
            days: 30
          })).unwrap(),
          dispatch(fetchExchangeRateCharges({
            company_id: companyID,
            limit: 10,
            offset: 0
          })).unwrap(),
        ]);
      } catch (err) {
        console.error('Failed to initialize exchange rates data:', err);
      }
    };

    initializeData();
  }, [dispatch, companyID]);

  const handleRefreshAll = async () => {
    if (!companyID) return;
    
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchCurrentRates(["EUR/DZD", "USD/DZD"])).unwrap(),
        dispatch(fetchExchangeRateSources()).unwrap(),
        dispatch(fetchExchangeRateHistory({ 
          source: 'EUR',
          target: 'DZD',
          days: 30
        })).unwrap(),
        dispatch(fetchExchangeRateCharges({
          company_id: companyID,
          limit: 10,
          offset: 0
        })).unwrap(),
      ]);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSourceChange = (sourceId: string) => {
    dispatch(setSelectedSource(sourceId as any));
  };

  const handleNewExchangeSubmit = useCallback(async (data: any) => {
    if (!companyID) return;
    
    try {
      // In a real implementation, this would dispatch a create action
      console.log('Creating new exchange:', data);
      setShowNewExchangeDialog(false);
      // Refresh data after creating
      await dispatch(fetchExchangeRateCharges({
        company_id: companyID,
        limit: 10,
        offset: 0
      })).unwrap();
    } catch (err) {
      console.error('Failed to create exchange:', err);
    }
  }, [companyID, dispatch]);

  const handleCancelDialog = useCallback(() => {
    setShowNewExchangeDialog(false);
  }, []);

  // Get current EUR/DZD rate for form
  const currentEurDzdRate = currentRates?.['EUR/DZD'] || 0;

  // Processing rates for comparison component
  const ratesForComparison = rateSources.reduce((acc, source) => {
    if (currentRates && currentRates[`${source.ID}`]) {
      acc[source.ID.toString()] = currentRates[`${source.ID}`];
    }
    return acc;
  }, {} as Record<string, number>);

  if (!companyID) {
    return (
      <ErrorState
        type="general"
        title="No Company Selected"
        description="Please select a company to view exchange rates."
        variant="page"
      />
    );
  }

  if (loading && !exchangeRatesState.charges.length) {
    return (
      <PageLoading 
        type="dashboard" 
        text="Loading exchange rates..." 
      />
    );
  }

  if (error && !exchangeRatesState.charges.length) {
    return (
      <ErrorState
        type="server"
        title="Failed to Load Exchange Rates"
        description={error}
        onRetry={() => dispatch(fetchCurrentRates(["EUR/DZD", "USD/DZD"]))}
        variant="page"
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exchange Rates</h1>
          <p className="text-muted-foreground mt-1">
            Monitor, track, and manage currency exchange rates and related charges
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Last updated: {format(new Date(), 'HH:mm')}</span>
          </Badge>
          
          <Button
            variant="outline"
            onClick={handleRefreshAll}
            disabled={refreshing}
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
            Refresh
          </Button>
          
          <Dialog open={showNewExchangeDialog} onOpenChange={setShowNewExchangeDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Record Exchange
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Record Exchange Rate Transaction</DialogTitle>
                <DialogDescription>
                  Record a new exchange rate transaction and calculate any losses or gains.
                </DialogDescription>
              </DialogHeader>
              <ExchangeForm
                sources={rateSources}
                currentOfficialRate={currentEurDzdRate}
                onSubmit={handleNewExchangeSubmit}
                onCancel={handleCancelDialog}
                variant="modal"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current EUR/DZD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentEurDzdRate ? currentEurDzdRate.toFixed(4) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {rateSources.length} sources active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exchangeCharges.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Exchange transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Sources</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rateSources.filter(s => s.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {rateSources.length} configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rateHistory.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Calculator</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Compare</span>
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Sources</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <ExchangeDashboard />
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExchangeCalculator />
            
            {/* Recent Exchanges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Recent Exchanges</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exchangeCharges.length > 0 ? (
                  <div className="space-y-3">
                    {exchangeCharges.slice(0, 5).map((charge) => (
                      <div key={charge.ID || Math.random()} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">
                            {charge?.source_currency || 'N/A'} → {charge?.target_currency || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {charge?.rate_date ? (() => {
                              try {
                                const date = new Date(charge.rate_date);
                                if (isNaN(date.getTime())) {
                                  return 'Invalid Date';
                                }
                                return format(date, 'MMM dd, yyyy');
                              } catch (error) {
                                return 'Invalid Date';
                              }
                            })() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm">
                            {charge?.source_amount?.toLocaleString() || '0'} {charge?.source_currency || ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @ {charge?.exchange_rate?.toFixed(4) || '0.0000'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent exchanges found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ExchangeHistoryChart
            data={rateHistory}
            currencyPair="EUR/DZD"
            loading={exchangeRatesState.historyLoading}
            height={500}
            showControls={true}
            showStats={true}
          />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <RateComparison
            sources={rateSources}
            rates={ratesForComparison}
            currencyPair="EUR/DZD"
            loading={exchangeRatesState.sourcesLoading}
            onRefresh={handleRefreshAll}
            showDetails={true}
          />
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <RateSourceSelector
            sources={rateSources}
            selectedSource={selectedSource?.ID?.toString() || undefined}
            loading={exchangeRatesState.sourcesLoading}
            error={exchangeRatesState.error || undefined}
            showDetails={true}
            onSourceChange={handleSourceChange}
            onRefresh={() => dispatch(fetchExchangeRateSources())}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExchangeRatesPage;