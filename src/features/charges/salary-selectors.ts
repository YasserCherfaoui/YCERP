// Selectors for salary state
import { RootState } from '@/app/store';
import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectSalaryState = (state: RootState) => state.salary;
export const selectSalaryCharges = (state: RootState) => state.salary.salaryCharges;
export const selectSelectedSalaryCharge = (state: RootState) => state.salary.selectedSalaryCharge;
export const selectSalaryLoading = (state: RootState) => state.salary.loading;
export const selectSalaryError = (state: RootState) => state.salary.error;

// Templates and payroll
export const selectSalaryTemplates = (state: RootState) => state.salary.salaryTemplates;
export const selectPayrollBatches = (state: RootState) => state.salary.payrollBatches;
export const selectSalaryHistory = (state: RootState) => state.salary.salaryHistory;
export const selectClockInRecords = (state: RootState) => state.salary.clockInRecords;
export const selectPendingApprovals = (state: RootState) => state.salary.pendingApprovals;

// Loading states
export const selectTemplatesLoading = (state: RootState) => state.salary.templatesLoading;
export const selectBatchesLoading = (state: RootState) => state.salary.batchesLoading;
export const selectHistoryLoading = (state: RootState) => state.salary.historyLoading;
export const selectClockInLoading = (state: RootState) => state.salary.clockInLoading;
export const selectApprovalsLoading = (state: RootState) => state.salary.approvalsLoading;

// Calculator
export const selectSalaryCalculator = (state: RootState) => state.salary.calculator;
export const selectCalculatorParams = (state: RootState) => state.salary.calculator.params;
export const selectCalculatorResult = (state: RootState) => state.salary.calculator.result;
export const selectCalculatorLoading = (state: RootState) => state.salary.calculator.loading;
export const selectCalculatorError = (state: RootState) => state.salary.calculator.error;

// Bulk operations
export const selectBulkOperation = (state: RootState) => state.salary.bulkOperation;
export const selectBulkOperationLoading = (state: RootState) => state.salary.bulkOperation.loading;
export const selectBulkOperationResult = (state: RootState) => state.salary.bulkOperation.result;
export const selectBulkOperationError = (state: RootState) => state.salary.bulkOperation.error;

// Dashboard
export const selectSalaryDashboard = (state: RootState) => state.salary.dashboard;
export const selectDashboardData = (state: RootState) => state.salary.dashboard.data;
export const selectDashboardLoading = (state: RootState) => state.salary.dashboard.loading;
export const selectDashboardError = (state: RootState) => state.salary.dashboard.error;

// Filters and pagination
export const selectSalaryFilters = (state: RootState) => state.salary.filters;
export const selectSalaryPagination = (state: RootState) => state.salary.pagination;

// Form state
export const selectFormData = (state: RootState) => state.salary.formData;
export const selectFormErrors = (state: RootState) => state.salary.formErrors;
export const selectIsSubmitting = (state: RootState) => state.salary.isSubmitting;

// Selection
export const selectSelectedSalaryChargeIds = (state: RootState) => state.salary.selectedSalaryChargeIds;
export const selectPayrollBatchForm = (state: RootState) => state.salary.payrollBatchForm;

// Computed selectors

// Filtered salary charges
export const selectFilteredSalaryCharges = createSelector(
  [selectSalaryCharges, selectSalaryFilters],
  (salaryCharges, filters) => {
    let filtered = [...salaryCharges];

    // Filter by employee ID
    if (filters.employee_id) {
      filtered = filtered.filter(charge => charge.employee_id === filters.employee_id);
    }

    // Filter by department
    if (filters.department) {
      filtered = filtered.filter(charge => 
        charge.employee_department?.toLowerCase().includes(filters.department!.toLowerCase())
      );
    }

    // Filter by position
    if (filters.position) {
      filtered = filtered.filter(charge => 
        charge.employee_position.toLowerCase().includes(filters.position!.toLowerCase())
      );
    }

    // Filter by employment type
    if (filters.employment_type) {
      filtered = filtered.filter(charge => charge.employment_type === filters.employment_type);
    }

    // Filter by payment method
    if (filters.payment_method) {
      filtered = filtered.filter(charge => charge.payment_method === filters.payment_method);
    }

    // Filter by pay period
    if (filters.pay_period_start) {
      filtered = filtered.filter(charge => 
        new Date(charge.pay_period_start) >= new Date(filters.pay_period_start!)
      );
    }

    if (filters.pay_period_end) {
      filtered = filtered.filter(charge => 
        new Date(charge.pay_period_end) <= new Date(filters.pay_period_end!)
      );
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(charge =>
        charge.employee_name.toLowerCase().includes(searchTerm) ||
        charge.employee_position.toLowerCase().includes(searchTerm) ||
        charge.employee_department?.toLowerCase().includes(searchTerm) ||
        charge.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort
    if (filters.sort_by) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filters.sort_by) {
          case 'employee_name':
            aValue = a.employee_name.toLowerCase();
            bValue = b.employee_name.toLowerCase();
            break;
          case 'base_salary':
            aValue = a.base_salary;
            bValue = b.base_salary;
            break;
          case 'net_amount':
            aValue = a.net_amount;
            bValue = b.net_amount;
            break;
          case 'pay_period_start':
            aValue = new Date(a.pay_period_start);
            bValue = new Date(b.pay_period_start);
            break;
          case 'created_at':
            aValue = new Date(a.CreatedAt);
            bValue = new Date(b.CreatedAt);
            break;
          default:
            aValue = a.CreatedAt;
            bValue = b.CreatedAt;
        }

        if (aValue < bValue) return filters.sort_order === 'asc' ? -1 : 1;
        if (aValue > bValue) return filters.sort_order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }
);

// Selected salary charges
export const selectSelectedSalaryCharges = createSelector(
  [selectSalaryCharges, selectSelectedSalaryChargeIds],
  (salaryCharges, selectedIds) => {
    return salaryCharges.filter(charge => selectedIds.includes(charge.ID));
  }
);

// Salary analytics
export const selectSalaryAnalytics = createSelector(
  [selectFilteredSalaryCharges],
  (salaryCharges) => {
    if (salaryCharges.length === 0) {
      return {
        totalEmployees: 0,
        totalSalaryCost: 0,
        averageSalary: 0,
        totalOvertimeCost: 0,
        totalDeductions: 0,
        totalAllowances: 0,
        totalNetPayout: 0,
      };
    }

    const totalEmployees = salaryCharges.length;
    const totalSalaryCost = salaryCharges.reduce((sum, charge) => sum + charge.gross_amount, 0);
    const averageSalary = totalSalaryCost / totalEmployees;
    const totalOvertimeCost = salaryCharges.reduce((sum, charge) => sum + (charge.overtime_amount || 0), 0);
    const totalDeductions = salaryCharges.reduce((sum, charge) => sum + charge.total_deductions, 0);
    const totalAllowances = salaryCharges.reduce((sum, charge) => sum + charge.total_allowances, 0);
    const totalNetPayout = salaryCharges.reduce((sum, charge) => sum + charge.net_amount, 0);

    return {
      totalEmployees,
      totalSalaryCost,
      averageSalary,
      totalOvertimeCost,
      totalDeductions,
      totalAllowances,
      totalNetPayout,
    };
  }
);

// Department breakdown
export const selectDepartmentBreakdown = createSelector(
  [selectFilteredSalaryCharges],
  (salaryCharges) => {
    const departments = new Map<string, {
      count: number;
      totalCost: number;
      totalNet: number;
      averageSalary: number;
    }>();

    salaryCharges.forEach(charge => {
      const dept = charge.employee_department || 'No Department';
      const existing = departments.get(dept) || { count: 0, totalCost: 0, totalNet: 0, averageSalary: 0 };
      
      existing.count += 1;
      existing.totalCost += charge.gross_amount;
      existing.totalNet += charge.net_amount;
      existing.averageSalary = existing.totalCost / existing.count;
      
      departments.set(dept, existing);
    });

    return Array.from(departments.entries()).map(([department, stats]) => ({
      department,
      ...stats,
    }));
  }
);

// Position breakdown
export const selectPositionBreakdown = createSelector(
  [selectFilteredSalaryCharges],
  (salaryCharges) => {
    const positions = new Map<string, {
      count: number;
      totalCost: number;
      totalNet: number;
      averageSalary: number;
    }>();

    salaryCharges.forEach(charge => {
      const position = charge.employee_position;
      const existing = positions.get(position) || { count: 0, totalCost: 0, totalNet: 0, averageSalary: 0 };
      
      existing.count += 1;
      existing.totalCost += charge.gross_amount;
      existing.totalNet += charge.net_amount;
      existing.averageSalary = existing.totalCost / existing.count;
      
      positions.set(position, existing);
    });

    return Array.from(positions.entries()).map(([position, stats]) => ({
      position,
      ...stats,
    }));
  }
);

// Employment type breakdown
export const selectEmploymentTypeBreakdown = createSelector(
  [selectFilteredSalaryCharges],
  (salaryCharges) => {
    const types = new Map<string, {
      count: number;
      totalCost: number;
      totalNet: number;
      averageSalary: number;
    }>();

    salaryCharges.forEach(charge => {
      const type = charge.employment_type;
      const existing = types.get(type) || { count: 0, totalCost: 0, totalNet: 0, averageSalary: 0 };
      
      existing.count += 1;
      existing.totalCost += charge.gross_amount;
      existing.totalNet += charge.net_amount;
      existing.averageSalary = existing.totalCost / existing.count;
      
      types.set(type, existing);
    });

    return Array.from(types.entries()).map(([employmentType, stats]) => ({
      employmentType,
      ...stats,
    }));
  }
);

// Monthly trends
export const selectMonthlyTrends = createSelector(
  [selectFilteredSalaryCharges],
  (salaryCharges) => {
    const months = new Map<string, {
      month: string;
      totalCost: number;
      employeeCount: number;
      overtimeCost: number;
      averageSalary: number;
    }>();

    salaryCharges.forEach(charge => {
      const date = new Date(charge.pay_period_start);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      const existing = months.get(monthKey) || {
        month: monthLabel,
        totalCost: 0,
        employeeCount: 0,
        overtimeCost: 0,
        averageSalary: 0,
      };
      
      existing.totalCost += charge.gross_amount;
      existing.employeeCount += 1;
      existing.overtimeCost += charge.overtime_amount || 0;
      existing.averageSalary = existing.totalCost / existing.employeeCount;
      
      months.set(monthKey, existing);
    });

    return Array.from(months.values()).sort((a, b) => a.month.localeCompare(b.month));
  }
);

// Top earners
export const selectTopEarners = createSelector(
  [selectFilteredSalaryCharges],
  (salaryCharges) => {
    return [...salaryCharges]
      .sort((a, b) => b.net_amount - a.net_amount)
      .slice(0, 10)
      .map(charge => ({
        employee_name: charge.employee_name,
        position: charge.employee_position,
        department: charge.employee_department,
        net_amount: charge.net_amount,
        gross_amount: charge.gross_amount,
      }));
  }
);

// Recent salary changes (from history)
export const selectRecentSalaryChanges = createSelector(
  [selectSalaryHistory],
  (salaryHistory) => {
    return [...salaryHistory]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }
);

// Pending approvals count
export const selectPendingApprovalsCount = createSelector(
  [selectPendingApprovals],
  (pendingApprovals) => pendingApprovals.length
);

// Overtime analysis
export const selectOvertimeAnalysis = createSelector(
  [selectFilteredSalaryCharges],
  (salaryCharges) => {
    const chargesWithOvertime = salaryCharges.filter(charge => 
      charge.overtime_hours && charge.overtime_hours > 0
    );

    const totalOvertimeHours = chargesWithOvertime.reduce(
      (sum, charge) => sum + (charge.overtime_hours || 0), 0
    );
    const totalOvertimeCost = chargesWithOvertime.reduce(
      (sum, charge) => sum + (charge.overtime_amount || 0), 0
    );
    const averageOvertimePerEmployee = chargesWithOvertime.length > 0 
      ? totalOvertimeHours / chargesWithOvertime.length 
      : 0;

    return {
      employeesWithOvertime: chargesWithOvertime.length,
      totalOvertimeHours,
      totalOvertimeCost,
      averageOvertimePerEmployee,
      overtimePercentage: salaryCharges.length > 0 
        ? (chargesWithOvertime.length / salaryCharges.length) * 100 
        : 0,
    };
  }
);

// Payroll status
export const selectPayrollStatus = createSelector(
  [selectPayrollBatches],
  (payrollBatches) => {
    const total = payrollBatches.length;
    const completed = payrollBatches.filter(batch => batch.status === 'completed').length;
    const processing = payrollBatches.filter(batch => batch.status === 'processing').length;
    const draft = payrollBatches.filter(batch => batch.status === 'draft').length;

    return {
      total,
      completed,
      processing,
      draft,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    };
  }
);

// Form validation
export const selectFormValidation = createSelector(
  [selectFormData, selectFormErrors],
  (formData, formErrors) => ({
    isValid: formData !== null && Object.keys(formErrors).length === 0,
    hasErrors: Object.keys(formErrors).length > 0,
    errorCount: Object.keys(formErrors).length,
  })
);

export default {
  // Basic selectors
  selectSalaryState,
  selectSalaryCharges,
  selectSelectedSalaryCharge,
  selectSalaryLoading,
  selectSalaryError,
  
  // Templates and payroll
  selectSalaryTemplates,
  selectPayrollBatches,
  selectSalaryHistory,
  selectClockInRecords,
  selectPendingApprovals,
  
  // Loading states
  selectTemplatesLoading,
  selectBatchesLoading,
  selectHistoryLoading,
  selectClockInLoading,
  selectApprovalsLoading,
  
  // Calculator
  selectSalaryCalculator,
  selectCalculatorParams,
  selectCalculatorResult,
  selectCalculatorLoading,
  selectCalculatorError,
  
  // Bulk operations
  selectBulkOperation,
  selectBulkOperationLoading,
  selectBulkOperationResult,
  selectBulkOperationError,
  
  // Dashboard
  selectSalaryDashboard,
  selectDashboardData,
  selectDashboardLoading,
  selectDashboardError,
  
  // Filters and pagination
  selectSalaryFilters,
  selectSalaryPagination,
  
  // Form state
  selectFormData,
  selectFormErrors,
  selectIsSubmitting,
  
  // Selection
  selectSelectedSalaryChargeIds,
  selectPayrollBatchForm,
  
  // Computed selectors
  selectFilteredSalaryCharges,
  selectSelectedSalaryCharges,
  selectSalaryAnalytics,
  selectDepartmentBreakdown,
  selectPositionBreakdown,
  selectEmploymentTypeBreakdown,
  selectMonthlyTrends,
  selectTopEarners,
  selectRecentSalaryChanges,
  selectPendingApprovalsCount,
  selectOvertimeAnalysis,
  selectPayrollStatus,
  selectFormValidation,
};