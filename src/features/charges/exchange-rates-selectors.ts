// Selectors for exchange rates state
import { RootState } from '@/app/store';
import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectExchangeRatesState = (state: RootState) => state.exchangeRates;
export const selectExchangeRateCharges = (state: RootState) => state.exchangeRates.charges;
export const selectSelectedExchangeRateCharge = (state: RootState) => state.exchangeRates.selectedCharge;
export const selectExchangeRatesLoading = (state: RootState) => state.exchangeRates.loading;
export const selectExchangeRatesError = (state: RootState) => state.exchangeRates.error;

// Company selector
export const selectCompanyID = (state: RootState) => state.company.company?.ID;

// Current rates and sources
export const selectCurrentRates = (state: RootState) => state.exchangeRates.currentRates;
export const selectRateSources = (state: RootState) => state.exchangeRates.rateSources;
export const selectSelectedSource = (state: RootState) => state.exchangeRates.selectedSource;
export const selectSourcesLoading = (state: RootState) => state.exchangeRates.sourcesLoading;

// Rate history and analytics
export const selectRateHistory = (state: RootState) => state.exchangeRates.rateHistory;
export const selectHistoryLoading = (state: RootState) => state.exchangeRates.historyLoading;
export const selectAnalytics = (state: RootState) => state.exchangeRates.analytics;
export const selectAnalyticsLoading = (state: RootState) => state.exchangeRates.analyticsLoading;

// Alerts
export const selectExchangeRateAlerts = (state: RootState) => state.exchangeRates.alerts;
export const selectAlertsLoading = (state: RootState) => state.exchangeRates.alertsLoading;

// Live data
export const selectLiveRate = (state: RootState) => state.exchangeRates.liveRate;
export const selectRateComparison = (state: RootState) => state.exchangeRates.rateComparison;
export const selectQuickConversion = (state: RootState) => state.exchangeRates.quickConversion;

// Calculator
export const selectCalculator = (state: RootState) => state.exchangeRates.calculator;
export const selectCalculatorResult = (state: RootState) => state.exchangeRates.calculator.calculation;

// Filters and form
export const selectExchangeRateFilters = (state: RootState) => state.exchangeRates.filters;
export const selectFormData = (state: RootState) => state.exchangeRates.formData;
export const selectFormErrors = (state: RootState) => state.exchangeRates.formErrors;
export const selectIsSubmitting = (state: RootState) => state.exchangeRates.isSubmitting;

// Real-time settings
export const selectAutoRefreshEnabled = (state: RootState) => state.exchangeRates.autoRefreshEnabled;
export const selectRefreshInterval = (state: RootState) => state.exchangeRates.refreshInterval;
export const selectLastRateUpdate = (state: RootState) => state.exchangeRates.lastRateUpdate;

// Computed selectors
export const selectFilteredExchangeRateCharges = createSelector(
  [selectExchangeRateCharges, selectExchangeRateFilters],
  (charges, filters) => {
    // Ensure charges is an array and handle null/undefined cases
    if (!charges || !Array.isArray(charges)) {
      return [];
    }
    
    return charges.filter(charge => {
      // Source currency filter
      if (filters.source_currency && charge.source_currency !== filters.source_currency) {
        return false;
      }
      
      // Target currency filter
      if (filters.target_currency && charge.target_currency !== filters.target_currency) {
        return false;
      }
      
      // Rate source filter
      if (filters.rate_source && charge.rate_source !== filters.rate_source) {
        return false;
      }
      
      // Date range filter
      if (filters.date_from) {
        const chargeDate = new Date(charge.rate_date);
        const fromDate = new Date(filters.date_from);
        if (chargeDate < fromDate) {
          return false;
        }
      }
      
      if (filters.date_to) {
        const chargeDate = new Date(charge.rate_date);
        const toDate = new Date(filters.date_to);
        if (chargeDate > toDate) {
          return false;
        }
      }
      
      // Purpose filter
      if (filters.purpose && charge.purpose !== filters.purpose) {
        return false;
      }
      
      // Amount range filter
      if (filters.amount_min && charge.source_amount < filters.amount_min) {
        return false;
      }
      
      if (filters.amount_max && charge.source_amount > filters.amount_max) {
        return false;
      }
      
      return true;
    });
  }
);

// Exchange rate analytics
export const selectExchangeRateAnalytics = createSelector(
  [selectAnalytics],
  (analytics) => {
    if (!analytics || !analytics.summary) {
      return {
        totalExchanges: 0,
        totalSourceAmount: 0,
        totalTargetAmount: 0,
        totalFees: 0,
        totalLossGain: 0,
        averageRate: 0,
        averageFee: 0,
      };
    }
    
    const { summary } = analytics;
    
    // The API returns:
    // - total_source_amount: in DZD (source currency)
    // - total_target_amount: in EUR (target currency) 
    // - total_amount_exchanged: in EUR (target currency)
    // - net_loss_gain: in DZD (source currency)
    // - total_fees_paid: in DZD (source currency)
    
    return {
      totalExchanges: summary.total_exchanges || 0,
      totalSourceAmount: summary.total_source_amount || 0, // DZD
      totalTargetAmount: summary.total_target_amount || 0, // EUR
      totalFees: summary.total_fees_paid || 0, // DZD
      totalLossGain: summary.net_loss_gain || 0, // DZD
      averageRate: summary.average_rate || 0,
      averageFee: summary.total_fees_paid && summary.total_exchanges ? summary.total_fees_paid / summary.total_exchanges : 0,
    };
  }
);

// Currency pair analytics
export const selectCurrencyPairAnalytics = createSelector(
  [selectAnalytics],
  (analytics) => {
    if (!analytics || !analytics.currency_breakdown) {
      return {};
    }
    
    const pairAnalytics: Record<string, {
      count: number;
      totalAmount: number;
      averageRate: number;
      totalFees: number;
      totalLossGain: number;
      sourceCurrency: string;
      targetCurrency: string;
    }> = {};
    
    analytics.currency_breakdown.forEach((breakdown: {
      source_currency: string;
      target_currency: string;
      total_amount: number;
      count: number;
      average_rate: number;
    }) => {
      const pair = `${breakdown.source_currency}/${breakdown.target_currency}`;
      
      // For DZD/EUR pair, we need to:
      // 1. Convert average rate from DZD/EUR to EUR/DZD (1 / rate)
      // 2. total_amount is already in EUR (target currency)
      let displayRate = breakdown.average_rate || 0;
      if (breakdown.source_currency === "DZD" && breakdown.target_currency === "EUR") {
        displayRate = breakdown.average_rate > 0 ? 1 / breakdown.average_rate : 0;
      }
      
      pairAnalytics[pair] = {
        count: breakdown.count || 0,
        totalAmount: breakdown.total_amount || 0, // This is in EUR for DZD/EUR
        averageRate: displayRate,
        totalFees: 0, // Not provided in the new API response
        totalLossGain: 0, // Not provided in the new API response
        sourceCurrency: breakdown.source_currency,
        targetCurrency: breakdown.target_currency,
      };
    });
    
    return pairAnalytics;
  }
);

// Rate source performance
export const selectSourcePerformance = createSelector(
  [selectExchangeRateCharges],
  (charges) => {
    // Ensure charges is an array and handle null/undefined cases
    if (!charges || !Array.isArray(charges)) {
      return {};
    }
    
    const sourcePerformance: Record<string, {
      count: number;
      averageRate: number;
      totalLossGain: number;
      totalFees: number;
      reliability: number;
    }> = {};
    
    charges.forEach(charge => {
      const source = charge.rate_source;
      
      if (!sourcePerformance[source]) {
        sourcePerformance[source] = {
          count: 0,
          averageRate: 0,
          totalLossGain: 0,
          totalFees: 0,
          reliability: 0,
        };
      }
      
      sourcePerformance[source].count += 1;
      sourcePerformance[source].totalLossGain += charge.loss_gain_amount || 0;
      sourcePerformance[source].totalFees += charge.fee_amount || 0;
    });
    
    // Calculate average rates and reliability
    Object.keys(sourcePerformance).forEach(source => {
      const sourceCharges = charges.filter(c => c.rate_source === source);
      const totalSourceAmount = sourceCharges.reduce((sum, c) => sum + (c.source_amount || 0), 0);
      const totalTargetAmount = sourceCharges.reduce((sum, c) => sum + (c.target_amount || 0), 0);
      const calculatedRate = totalSourceAmount > 0 ? totalTargetAmount / totalSourceAmount : 0;
      sourcePerformance[source].averageRate = isNaN(calculatedRate) || !isFinite(calculatedRate) ? 0 : calculatedRate;
      
      // Simple reliability score based on consistency and loss/gain
      const avgLossGain = sourcePerformance[source].count > 0 ? sourcePerformance[source].totalLossGain / sourcePerformance[source].count : 0;
      sourcePerformance[source].reliability = Math.max(0, 100 - Math.abs(avgLossGain * 10));
    });
    
    return sourcePerformance;
  }
);

// Monthly trends
export const selectMonthlyTrends = createSelector(
  [selectExchangeRateCharges],
  (charges) => {
    // Ensure charges is an array and handle null/undefined cases
    if (!charges || !Array.isArray(charges)) {
      return [];
    }
    
    const monthlyData: Record<string, {
      count: number;
      totalAmount: number;
      averageRate: number;
      totalFees: number;
      totalLossGain: number;
    }> = {};
    
    charges.forEach(charge => {
      const date = new Date(charge.rate_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          count: 0,
          totalAmount: 0,
          averageRate: 0,
          totalFees: 0,
          totalLossGain: 0,
        };
      }
      
      monthlyData[monthKey].count += 1;
      monthlyData[monthKey].totalAmount += charge.source_amount || 0;
      monthlyData[monthKey].totalFees += charge.fee_amount || 0;
      monthlyData[monthKey].totalLossGain += charge.loss_gain_amount || 0;
    });
    
    // Calculate average rates
    Object.keys(monthlyData).forEach(month => {
      const monthCharges = charges.filter(c => {
        const date = new Date(c.rate_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === month;
      });
      const totalTargetAmount = monthCharges.reduce((sum, c) => sum + (c.target_amount || 0), 0);
      const calculatedRate = monthlyData[month].totalAmount > 0 ? totalTargetAmount / monthlyData[month].totalAmount : 0;
      monthlyData[month].averageRate = isNaN(calculatedRate) || !isFinite(calculatedRate) ? 0 : calculatedRate;
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
);

// Best and worst rates
export const selectBestWorstRates = createSelector(
  [selectExchangeRateCharges],
  (charges) => {
    // Ensure charges is an array and handle null/undefined cases
    if (!charges || !Array.isArray(charges) || charges.length === 0) {
      return { best: null, worst: null };
    }
    
    const sortedByRate = [...charges].sort((a, b) => (b.exchange_rate || 0) - (a.exchange_rate || 0));
    
    return {
      best: sortedByRate[0],
      worst: sortedByRate[sortedByRate.length - 1],
    };
  }
);

// Active alerts
export const selectActiveAlerts = createSelector(
  [selectExchangeRateAlerts],
  (alerts) => {
    return alerts.filter(alert => alert.is_active);
  }
);

// Triggered alerts
export const selectTriggeredAlerts = createSelector(
  [selectExchangeRateAlerts],
  (alerts) => {
    return alerts.filter(alert => alert.triggered_at);
  }
);

// Rate trend analysis
export const selectRateTrend = createSelector(
  [selectRateHistory],
  (history) => {
    if (history.length < 2) {
      return { trend: 'stable', change: 0, changePercentage: 0 };
    }
    
    const sorted = [...history].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    
    const change = latest.rate - previous.rate;
    const changePercentage = previous.rate !== 0 ? (change / previous.rate) * 100 : 0;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(changePercentage) > 0.1) {
      trend = change > 0 ? 'increasing' : 'decreasing';
    }
    
    return {
      trend,
      change: isNaN(change) || !isFinite(change) ? 0 : Math.round(change * 10000) / 10000,
      changePercentage: isNaN(changePercentage) || !isFinite(changePercentage) ? 0 : Math.round(changePercentage * 100) / 100,
    };
  }
);

// Current rate status
export const selectCurrentRateStatus = createSelector(
  [selectCurrentRates, selectLastRateUpdate],
  (rates, lastUpdate) => {
    const now = new Date();
    const lastUpdateTime = lastUpdate ? new Date(lastUpdate) : null;
    const minutesSinceUpdate = lastUpdateTime 
      ? (now.getTime() - lastUpdateTime.getTime()) / (1000 * 60)
      : null;
    
    const isStale = minutesSinceUpdate ? minutesSinceUpdate > 5 : true;
    
    return {
      hasRates: Object.keys(rates).length > 0,
      isStale,
      lastUpdate: lastUpdateTime,
      minutesSinceUpdate: minutesSinceUpdate ? Math.round(minutesSinceUpdate) : null,
    };
  }
);

// Form validation
export const selectFormValidation = createSelector(
  [selectFormData, selectFormErrors],
  (formData, formErrors) => {
    const hasErrors = Object.keys(formErrors).length > 0;
    const isFormValid = formData && 
      formData.title?.trim() &&
      formData.source_currency &&
      formData.target_currency &&
      formData.source_amount &&
      formData.source_amount > 0 &&
      formData.exchange_rate &&
      formData.exchange_rate > 0 &&
      formData.rate_source &&
      formData.rate_date &&
      !hasErrors;
    
    return {
      isValid: Boolean(isFormValid),
      hasErrors,
      errorCount: Object.keys(formErrors).length,
    };
  }
);

// Calculator validation
export const selectCalculatorValidation = createSelector(
  [selectCalculator],
  (calculator) => {
    const isValid = calculator.sourceAmount > 0 &&
      calculator.sourceCurrency &&
      calculator.targetCurrency &&
      calculator.sourceCurrency !== calculator.targetCurrency &&
      calculator.selectedSource;
    
    return {
      isValid,
      canCalculate: isValid,
    };
  }
);