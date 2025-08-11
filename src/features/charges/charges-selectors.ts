// Selectors for charges state
import { RootState } from '@/app/store';
import { Charge, ChargeStatus, ChargeType } from '@/models/data/charges/charge.model';
import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectChargesState = (state: RootState) => state.charges;
export const selectCharges = (state: RootState) => state.charges.charges;
export const selectSelectedCharge = (state: RootState) => state.charges.selectedCharge;
export const selectChargesLoading = (state: RootState) => state.charges.loading;
export const selectChargesError = (state: RootState) => state.charges.error;
export const selectChargeCategories = (state: RootState) => state.charges.categories;
export const selectChargesDashboard = (state: RootState) => state.charges.dashboard;
export const selectChargesAnalytics = (state: RootState) => state.charges.analytics;

// Filters and pagination
export const selectChargeFilters = (state: RootState) => state.charges.filters;
export const selectChargePagination = (state: RootState) => state.charges.pagination;
export const selectChargeViewMode = (state: RootState) => state.charges.viewMode;
export const selectChargeSorting = (state: RootState) => ({
  sortBy: state.charges.sortBy,
  sortOrder: state.charges.sortOrder,
});

// Form state
export const selectChargeFormData = (state: RootState) => state.charges.formData;
export const selectChargeFormErrors = (state: RootState) => state.charges.formErrors;
export const selectChargeSubmitting = (state: RootState) => state.charges.isSubmitting;

// Bulk operations
export const selectSelectedChargeIds = (state: RootState) => state.charges.selectedChargeIds;
export const selectBulkOperationInProgress = (state: RootState) => state.charges.bulkOperationInProgress;

// Loading states
export const selectDashboardLoading = (state: RootState) => state.charges.dashboardLoading;
export const selectAnalyticsLoading = (state: RootState) => state.charges.analyticsLoading;

// Cache state
export const selectCacheValid = (state: RootState) => state.charges.cacheValid;
export const selectLastFetchTime = (state: RootState) => state.charges.lastFetchTime;
export const selectLastSyncTime = (state: RootState) => state.charges.lastSyncTime;

// Computed selectors
export const selectFilteredCharges = createSelector(
  [selectCharges, selectChargeFilters],
  (charges, filters) => {
    return charges.filter(charge => {
      // Type filter
      if (filters.type && charge.type !== filters.type) {
        return false;
      }
      
      // Status filter
      if (filters.status && charge.status !== filters.status) {
        return false;
      }
      
      // Date range filter
      if (filters.date_from) {
        const chargeDate = new Date(charge.date);
        const fromDate = new Date(filters.date_from);
        if (chargeDate < fromDate) {
          return false;
        }
      }
      
      if (filters.date_to) {
        const chargeDate = new Date(charge.date);
        const toDate = new Date(filters.date_to);
        if (chargeDate > toDate) {
          return false;
        }
      }
      
      // Amount range filter
      if (filters.amount_min && charge.amount < filters.amount_min) {
        return false;
      }
      
      if (filters.amount_max && charge.amount > filters.amount_max) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          charge.title,
          charge.description,
          charge.reference_number,
          charge.notes,
          ...(charge.tags || [])
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }
      
      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const chargeTags = charge.tags || [];
        const hasMatchingTag = filters.tags.some(tag => 
          chargeTags.includes(tag)
        );
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      // Priority filter
      if (filters.priority && charge.priority !== filters.priority) {
        return false;
      }
      
      // Created by filter
      if (filters.created_by && charge.created_by_id !== filters.created_by) {
        return false;
      }
      
      // Approval required filter
      if (filters.approval_required !== undefined && 
          charge.approval_required !== filters.approval_required) {
        return false;
      }
      
      return true;
    });
  }
);

export const selectSortedCharges = createSelector(
  [selectFilteredCharges, selectChargeSorting],
  (charges, { sortBy, sortOrder }) => {
    const sortedCharges = [...charges];
    
    sortedCharges.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      // Handle nested properties
      if (sortBy.includes('.')) {
        const keys = sortBy.split('.');
        aValue = keys.reduce((obj: any, key) => obj?.[key], a);
        bValue = keys.reduce((obj: any, key) => obj?.[key], b);
      } else {
        aValue = a[sortBy as keyof Charge];
        bValue = b[sortBy as keyof Charge];
      }
      
      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sortedCharges;
  }
);

// Analytics selectors
export const selectChargeAnalytics = createSelector(
  [selectCharges],
  (charges) => {
    if (charges.length === 0) {
      return {
        totalAmount: 0,
        averageAmount: 0,
        chargeCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        pendingAmount: 0,
        approvedAmount: 0,
        rejectedAmount: 0,
      };
    }
    
    const totalAmount = charges.reduce((sum, charge) => sum + charge.amount, 0);
    const averageAmount = totalAmount / charges.length;
    
    const pendingCharges = charges.filter(c => c.status === 'pending');
    const approvedCharges = charges.filter(c => c.status === 'approved');
    const rejectedCharges = charges.filter(c => c.status === 'rejected');
    
    const pendingAmount = pendingCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const approvedAmount = approvedCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const rejectedAmount = rejectedCharges.reduce((sum, charge) => sum + charge.amount, 0);
    
    return {
      totalAmount,
      averageAmount,
      chargeCount: charges.length,
      pendingCount: pendingCharges.length,
      approvedCount: approvedCharges.length,
      rejectedCount: rejectedCharges.length,
      pendingAmount,
      approvedAmount,
      rejectedAmount,
    };
  }
);

export const selectChargesByType = createSelector(
  [selectCharges],
  (charges) => {
    const chargesByType: Record<ChargeType, Charge[]> = {
      exchange_rate: [],
      salary: [],
      boxing: [],
      shipping: [],
      returns: [],
      other: [],
      advertising: [],
      rent_utility: [],
    };
    
    charges.forEach(charge => {
      if (chargesByType[charge.type]) {
        chargesByType[charge.type].push(charge);
      }
    });
    
    return chargesByType;
  }
);

export const selectChargesByStatus = createSelector(
  [selectCharges],
  (charges) => {
    const chargesByStatus: Record<ChargeStatus, Charge[]> = {
      pending: [],
      approved: [],
      rejected: [],
      draft: [],
    };
    
    charges.forEach(charge => {
      if (chargesByStatus[charge.status]) {
        chargesByStatus[charge.status].push(charge);
      }
    });
    
    return chargesByStatus;
  }
);

export const selectChargeAmountsByType = createSelector(
  [selectChargesByType],
  (chargesByType) => {
    const amountsByType: Record<ChargeType, number> = {
      exchange_rate: 0,
      salary: 0,
      boxing: 0,
      shipping: 0,
      returns: 0,
      other: 0,
      advertising: 0,
      rent_utility: 0,
    };
    
    Object.entries(chargesByType).forEach(([type, charges]) => {
      amountsByType[type as ChargeType] = charges.reduce((sum, charge) => sum + charge.amount, 0);
    });
    
    return amountsByType;
  }
);

export const selectChargeAmountsByStatus = createSelector(
  [selectChargesByStatus],
  (chargesByStatus) => {
    const amountsByStatus: Record<ChargeStatus, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      draft: 0,
    };
    
    Object.entries(chargesByStatus).forEach(([status, charges]) => {
      amountsByStatus[status as ChargeStatus] = charges.reduce((sum, charge) => sum + charge.amount, 0);
    });
    
    return amountsByStatus;
  }
);

// Recent charges selector
export const selectRecentCharges = createSelector(
  [selectCharges],
  (charges) => {
    return charges
      .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())
      .slice(0, 10);
  }
);

// Pending approvals selector
export const selectPendingApprovals = createSelector(
  [selectCharges],
  (charges) => {
    return charges
      .filter(charge => charge.status === 'pending' && charge.approval_required)
      .sort((a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime());
  }
);

// Overdue charges selector
export const selectOverdueCharges = createSelector(
  [selectCharges],
  (charges) => {
    const now = new Date();
    return charges.filter(charge => {
      // Define overdue logic based on charge status and dates
      if (charge.status === 'pending' && charge.approval_required) {
        const createdDate = new Date(charge.CreatedAt);
        const daysSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
        return daysSinceCreated > 7; // Consider pending charges older than 7 days as overdue
      }
      return false;
    });
  }
);

// High priority charges selector
export const selectHighPriorityCharges = createSelector(
  [selectCharges],
  (charges) => {
    return charges.filter(charge => charge.priority === 'high' || charge.priority === 'urgent');
  }
);

// Selected charges data
export const selectSelectedCharges = createSelector(
  [selectCharges, selectSelectedChargeIds],
  (charges, selectedIds) => {
    return charges.filter(charge => selectedIds.includes(charge.ID));
  }
);

export const selectSelectedChargesTotal = createSelector(
  [selectSelectedCharges],
  (selectedCharges) => {
    return selectedCharges.reduce((sum, charge) => sum + charge.amount, 0);
  }
);

// Check if all charges are selected
export const selectAllChargesSelected = createSelector(
  [selectCharges, selectSelectedChargeIds],
  (charges, selectedIds) => {
    return charges.length > 0 && charges.length === selectedIds.length;
  }
);

// Check if some charges are selected
export const selectSomeChargesSelected = createSelector(
  [selectSelectedChargeIds],
  (selectedIds) => {
    return selectedIds.length > 0;
  }
);

// Monthly trends selector
export const selectMonthlyTrends = createSelector(
  [selectCharges],
  (charges) => {
    const monthlyData: Record<string, { amount: number; count: number }> = {};
    
    charges.forEach(charge => {
      const date = new Date(charge.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { amount: 0, count: 0 };
      }
      
      monthlyData[monthKey].amount += charge.amount;
      monthlyData[monthKey].count += 1;
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
);

// Check if cache needs refresh
export const selectCacheNeedsRefresh = createSelector(
  [selectCacheValid, selectLastFetchTime],
  (cacheValid, lastFetchTime) => {
    if (!cacheValid || !lastFetchTime) {
      return true;
    }
    
    const lastFetch = new Date(lastFetchTime);
    const now = new Date();
    const minutesSinceLastFetch = (now.getTime() - lastFetch.getTime()) / (1000 * 60);
    
    // Refresh cache if data is older than 5 minutes
    return minutesSinceLastFetch > 5;
  }
);

// Form validation selector
export const selectFormValidation = createSelector(
  [selectChargeFormData, selectChargeFormErrors],
  (formData, formErrors) => {
    const hasErrors = Object.keys(formErrors).length > 0;
    const isFormValid = formData && 
      formData.title?.trim() &&
      formData.amount > 0 &&
      formData.type &&
      formData.currency &&
      formData.date &&
      formData.company_id &&
      !hasErrors;
    
    return {
      isValid: Boolean(isFormValid),
      hasErrors,
      errorCount: Object.keys(formErrors).length,
    };
  }
);