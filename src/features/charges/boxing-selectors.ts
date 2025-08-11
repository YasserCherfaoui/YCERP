// Selectors for boxing state
import { RootState } from '@/app/store';
import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
export const selectBoxingState = (state: RootState) => state.boxing;
export const selectBoxingCharges = (state: RootState) => state.boxing.boxingCharges;
export const selectSelectedBoxingCharge = (state: RootState) => state.boxing.selectedBoxingCharge;
export const selectBoxingLoading = (state: RootState) => state.boxing.loading;
export const selectBoxingError = (state: RootState) => state.boxing.error;

// Materials
export const selectPackagingMaterials = (state: RootState) => state.boxing.packagingMaterials;
export const selectSelectedMaterial = (state: RootState) => state.boxing.selectedMaterial;
export const selectMaterialsLoading = (state: RootState) => state.boxing.materialsLoading;

// Templates and batches
export const selectPackagingTemplates = (state: RootState) => state.boxing.packagingTemplates;
export const selectTemplatesLoading = (state: RootState) => state.boxing.templatesLoading;
export const selectPackagingBatches = (state: RootState) => state.boxing.packagingBatches;
export const selectSelectedBatch = (state: RootState) => state.boxing.selectedBatch;
export const selectBatchesLoading = (state: RootState) => state.boxing.batchesLoading;

// Analytics
export const selectMaterialUsageAnalytics = (state: RootState) => state.boxing.materialUsageAnalytics;
export const selectAnalyticsLoading = (state: RootState) => state.boxing.analyticsLoading;

// Calculator
export const selectBoxingCalculator = (state: RootState) => state.boxing.calculator;
export const selectCalculatorParams = (state: RootState) => state.boxing.calculator.params;
export const selectCalculatorResult = (state: RootState) => state.boxing.calculator.result;
export const selectCalculatorLoading = (state: RootState) => state.boxing.calculator.loading;
export const selectCalculatorError = (state: RootState) => state.boxing.calculator.error;

// Material requirements
export const selectMaterialRequirements = (state: RootState) => state.boxing.materialRequirements;
export const selectMaterialRequirementsData = (state: RootState) => state.boxing.materialRequirements.requirements;
export const selectMaterialRequirementsLoading = (state: RootState) => state.boxing.materialRequirements.loading;
export const selectMaterialRequirementsError = (state: RootState) => state.boxing.materialRequirements.error;

// Dashboard
export const selectBoxingDashboard = (state: RootState) => state.boxing.dashboard;
export const selectDashboardData = (state: RootState) => state.boxing.dashboard.data;
export const selectDashboardLoading = (state: RootState) => state.boxing.dashboard.loading;
export const selectDashboardError = (state: RootState) => state.boxing.dashboard.error;



// Filters and pagination
export const selectBoxingFilters = (state: RootState) => state.boxing.filters;
export const selectMaterialFilters = (state: RootState) => state.boxing.materialFilters;
export const selectBoxingPagination = (state: RootState) => state.boxing.pagination;
export const selectMaterialPagination = (state: RootState) => state.boxing.materialPagination;
export const selectBatchPagination = (state: RootState) => state.boxing.batchPagination;

// Form state
export const selectFormData = (state: RootState) => state.boxing.formData;
export const selectFormErrors = (state: RootState) => state.boxing.formErrors;
export const selectIsSubmitting = (state: RootState) => state.boxing.isSubmitting;

export const selectMaterialFormData = (state: RootState) => state.boxing.materialFormData;
export const selectMaterialFormErrors = (state: RootState) => state.boxing.materialFormErrors;
export const selectIsMaterialSubmitting = (state: RootState) => state.boxing.isMaterialSubmitting;

export const selectBatchFormData = (state: RootState) => state.boxing.batchFormData;
export const selectBatchFormErrors = (state: RootState) => state.boxing.batchFormErrors;
export const selectIsBatchSubmitting = (state: RootState) => state.boxing.isBatchSubmitting;

// Selection
export const selectSelectedBoxingChargeIds = (state: RootState) => state.boxing.selectedBoxingChargeIds;
export const selectSelectedMaterialIds = (state: RootState) => state.boxing.selectedMaterialIds;

// Import/Export
export const selectImportExport = (state: RootState) => state.boxing.importExport;
export const selectImportExportLoading = (state: RootState) => state.boxing.importExport.importing || state.boxing.importExport.exporting;
export const selectImportResult = (state: RootState) => state.boxing.importExport.importResult;
export const selectExportResult = (state: RootState) => state.boxing.importExport.exportResult;
export const selectImportExportError = (state: RootState) => state.boxing.importExport.error;

// Computed selectors

// Filtered boxing charges
export const selectFilteredBoxingCharges = createSelector(
  [selectBoxingCharges, selectBoxingFilters],
  (boxingCharges, filters) => {
    let filtered = [...boxingCharges];

    // Filter by product ID
    if (filters.product_id) {
      filtered = filtered.filter(charge => charge.product_id === filters.product_id);
    }

    // Filter by packaging type
    if (filters.packaging_type) {
      filtered = filtered.filter(charge => charge.packaging_type === filters.packaging_type);
    }

    // Filter by packaging size
    if (filters.packaging_size) {
      filtered = filtered.filter(charge => charge.packaging_size === filters.packaging_size);
    }

    // Filter by batch ID
    if (filters.batch_id) {
      filtered = filtered.filter(charge => charge.batch_id === filters.batch_id);
    }

    // Filter by packaging date range
    if (filters.packaging_date_from) {
      filtered = filtered.filter(charge => 
        new Date(charge.packaging_date) >= new Date(filters.packaging_date_from!)
      );
    }

    if (filters.packaging_date_to) {
      filtered = filtered.filter(charge => 
        new Date(charge.packaging_date) <= new Date(filters.packaging_date_to!)
      );
    }

    // Filter by quality check status
    if (filters.quality_check_passed !== undefined) {
      filtered = filtered.filter(charge => charge.quality_check_passed === filters.quality_check_passed);
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(charge =>
        charge.batch_id?.toLowerCase().includes(searchTerm) ||
        charge.packaging_type.toLowerCase().includes(searchTerm) ||
        charge.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort
    if (filters.sort_by) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filters.sort_by) {
          case 'packaging_date':
            aValue = new Date(a.packaging_date);
            bValue = new Date(b.packaging_date);
            break;
          case 'batch_size':
            aValue = a.batch_size;
            bValue = b.batch_size;
            break;
          case 'total_cost':
            aValue = a.total_material_cost + a.total_labor_cost;
            bValue = b.total_material_cost + b.total_labor_cost;
            break;
          case 'cost_per_item':
            aValue = a.cost_per_item;
            bValue = b.cost_per_item;
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

// Filtered packaging materials
export const selectFilteredPackagingMaterials = createSelector(
  [selectPackagingMaterials, selectMaterialFilters],
  (materials, filters) => {
    let filtered = [...materials];

    // Filter by material type
    if (filters.material_type) {
      filtered = filtered.filter(material => 
        material.type === filters.material_type || material.material_type === filters.material_type
      );
    }

    // Filter by low stock
    if (filters.low_stock_only) {
      filtered = filtered.filter(material => 
        material.current_stock !== undefined && 
        material.reorder_point !== undefined && 
        material.current_stock <= material.reorder_point
      );
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchTerm) ||
        material.description?.toLowerCase().includes(searchTerm) ||
        material.sku?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }
);

// Selected boxing charges
export const selectSelectedBoxingCharges = createSelector(
  [selectBoxingCharges, selectSelectedBoxingChargeIds],
  (boxingCharges, selectedIds) => {
    return boxingCharges.filter(charge => selectedIds.includes(charge.ID));
  }
);

// Selected materials
export const selectSelectedMaterials = createSelector(
  [selectPackagingMaterials, selectSelectedMaterialIds],
  (materials, selectedIds) => {
    return materials.filter(material => selectedIds.includes(material.ID));
  }
);

// Boxing analytics
export const selectBoxingAnalytics = createSelector(
  [selectFilteredBoxingCharges],
  (boxingCharges) => {
    if (boxingCharges.length === 0) {
      return {
        totalBatches: 0,
        totalItemsPackaged: 0,
        totalCost: 0,
        averageCostPerItem: 0,
        materialCostTotal: 0,
        laborCostTotal: 0,
        averageEfficiency: 0,
        qualityPassRate: 0,
      };
    }

    const totalBatches = new Set(boxingCharges.map(c => c.batch_id)).size;
    const totalItemsPackaged = boxingCharges.reduce((sum, charge) => sum + charge.batch_size, 0);
    const totalCost = boxingCharges.reduce((sum, charge) => sum + charge.total_material_cost + charge.total_labor_cost, 0);
    const averageCostPerItem = totalCost / totalItemsPackaged;
    const materialCostTotal = boxingCharges.reduce((sum, charge) => sum + charge.total_material_cost, 0);
    const laborCostTotal = boxingCharges.reduce((sum, charge) => sum + charge.total_labor_cost, 0);
    const averageEfficiency = boxingCharges.reduce((sum, charge) => sum + charge.packaging_efficiency, 0) / boxingCharges.length;
    const qualityPassedCount = boxingCharges.filter(charge => charge.quality_check_passed).length;
    const qualityPassRate = (qualityPassedCount / boxingCharges.length) * 100;

    return {
      totalBatches,
      totalItemsPackaged,
      totalCost,
      averageCostPerItem,
      materialCostTotal,
      laborCostTotal,
      averageEfficiency,
      qualityPassRate,
    };
  }
);

// Packaging type breakdown
export const selectPackagingTypeBreakdown = createSelector(
  [selectFilteredBoxingCharges],
  (boxingCharges) => {
    const types = new Map<string, {
      count: number;
      totalCost: number;
      totalItems: number;
      averageCostPerItem: number;
    }>();

    boxingCharges.forEach(charge => {
      const type = charge.packaging_type;
      const existing = types.get(type) || { count: 0, totalCost: 0, totalItems: 0, averageCostPerItem: 0 };
      
      existing.count += 1;
      existing.totalCost += charge.total_material_cost + charge.total_labor_cost;
      existing.totalItems += charge.batch_size;
      existing.averageCostPerItem = existing.totalCost / existing.totalItems;
      
      types.set(type, existing);
    });

    return Array.from(types.entries()).map(([type, stats]) => ({
      type,
      ...stats,
    }));
  }
);

// Packaging size breakdown
export const selectPackagingSizeBreakdown = createSelector(
  [selectFilteredBoxingCharges],
  (boxingCharges) => {
    const sizes = new Map<string, {
      count: number;
      totalCost: number;
      totalItems: number;
      averageCostPerItem: number;
    }>();

    boxingCharges.forEach(charge => {
      const size = charge.packaging_size;
      const existing = sizes.get(size) || { count: 0, totalCost: 0, totalItems: 0, averageCostPerItem: 0 };
      
      existing.count += 1;
      existing.totalCost += charge.total_material_cost + charge.total_labor_cost;
      existing.totalItems += charge.batch_size;
      existing.averageCostPerItem = existing.totalCost / existing.totalItems;
      
      sizes.set(size, existing);
    });

    return Array.from(sizes.entries()).map(([size, stats]) => ({
      size,
      ...stats,
    }));
  }
);

// Material cost analysis
export const selectMaterialCostAnalysis = createSelector(
  [selectFilteredBoxingCharges],
  (boxingCharges) => {
    const materialCosts = new Map<number, {
      material_id: number;
      material_name: string;
      total_quantity: number;
      total_cost: number;
      usage_count: number;
      average_cost_per_use: number;
    }>();

    boxingCharges.forEach(charge => {
      charge.materials_used.forEach(material => {
        const existing = materialCosts.get(material.ID) || {
          material_id: material.ID,
          material_name: material.name,
          total_quantity: 0,
          total_cost: 0,
          usage_count: 0,
          average_cost_per_use: 0,
        };
        
        existing.total_quantity += material.quantity_used;
        existing.total_cost += material.total_cost;
        existing.usage_count += 1;
        existing.average_cost_per_use = existing.total_cost / existing.usage_count;
        
        materialCosts.set(material.ID, existing);
      });
    });

    return Array.from(materialCosts.values()).sort((a, b) => b.total_cost - a.total_cost);
  }
);

// Efficiency trends
export const selectEfficiencyTrends = createSelector(
  [selectFilteredBoxingCharges],
  (boxingCharges) => {
    const trends = new Map<string, {
      date: string;
      efficiency: number;
      cost_per_item: number;
      quality_rate: number;
      items_packaged: number;
      batch_count: number;
    }>();

    boxingCharges.forEach(charge => {
      const date = new Date(charge.packaging_date).toISOString().split('T')[0];
      const existing = trends.get(date) || {
        date,
        efficiency: 0,
        cost_per_item: 0,
        quality_rate: 0,
        items_packaged: 0,
        batch_count: 0,
      };
      
      existing.efficiency += charge.packaging_efficiency;
      existing.cost_per_item += charge.cost_per_item;
      existing.quality_rate += charge.quality_check_passed ? 1 : 0;
      existing.items_packaged += charge.batch_size;
      existing.batch_count += 1;
      
      trends.set(date, existing);
    });

    return Array.from(trends.values()).map(trend => ({
      ...trend,
      efficiency: trend.efficiency / trend.batch_count,
      cost_per_item: trend.cost_per_item / trend.batch_count,
      quality_rate: (trend.quality_rate / trend.batch_count) * 100,
    })).sort((a, b) => a.date.localeCompare(b.date));
  }
);

// Low stock materials
export const selectLowStockMaterials = createSelector(
  [selectPackagingMaterials],
  (materials) => {
    return materials.filter(material => 
      material.current_stock <= material.reorder_point
    ).sort((a, b) => {
      const aRatio = a.current_stock / a.reorder_point;
      const bRatio = b.current_stock / b.reorder_point;
      return aRatio - bRatio;
    });
  }
);

// Batch status summary
export const selectBatchStatusSummary = createSelector(
  [selectPackagingBatches],
  (batches) => {
    const summary = {
      total: batches.length,
      planned: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      completion_rate: 0,
    };

    batches.forEach(batch => {
      summary[batch.status as keyof typeof summary] += 1;
    });

    summary.completion_rate = summary.total > 0 ? (summary.completed / summary.total) * 100 : 0;

    return summary;
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

export const selectMaterialFormValidation = createSelector(
  [selectMaterialFormData, selectMaterialFormErrors],
  (formData, formErrors) => ({
    isValid: formData !== null && Object.keys(formErrors).length === 0,
    hasErrors: Object.keys(formErrors).length > 0,
    errorCount: Object.keys(formErrors).length,
  })
);

export default {
  // Basic selectors
  selectBoxingState,
  selectBoxingCharges,
  selectSelectedBoxingCharge,
  selectBoxingLoading,
  selectBoxingError,
  
  // Materials
  selectPackagingMaterials,
  selectSelectedMaterial,
  selectMaterialsLoading,
  
  // Templates and batches
  selectPackagingTemplates,
  selectTemplatesLoading,
  selectPackagingBatches,
  selectSelectedBatch,
  selectBatchesLoading,
  
  // Analytics
  selectMaterialUsageAnalytics,
  selectAnalyticsLoading,
  
  // Calculator
  selectBoxingCalculator,
  selectCalculatorParams,
  selectCalculatorResult,
  selectCalculatorLoading,
  selectCalculatorError,
  
  // Material requirements
  selectMaterialRequirements,
  selectMaterialRequirementsData,
  selectMaterialRequirementsLoading,
  selectMaterialRequirementsError,
  
  // Dashboard
  selectBoxingDashboard,
  selectDashboardData,
  selectDashboardLoading,
  selectDashboardError,
  

  
  // Filters and pagination
  selectBoxingFilters,
  selectMaterialFilters,
  selectBoxingPagination,
  selectMaterialPagination,
  selectBatchPagination,
  
  // Form state
  selectFormData,
  selectFormErrors,
  selectIsSubmitting,
  selectMaterialFormData,
  selectMaterialFormErrors,
  selectIsMaterialSubmitting,
  selectBatchFormData,
  selectBatchFormErrors,
  selectIsBatchSubmitting,
  
  // Selection
  selectSelectedBoxingChargeIds,
  selectSelectedMaterialIds,
  
  // Import/Export
  selectImportExport,
  selectImportExportLoading,
  selectImportResult,
  selectExportResult,
  selectImportExportError,
  
  // Computed selectors
  selectFilteredBoxingCharges,
  selectFilteredPackagingMaterials,
  selectSelectedBoxingCharges,
  selectSelectedMaterials,
  selectBoxingAnalytics,
  selectPackagingTypeBreakdown,
  selectPackagingSizeBreakdown,
  selectMaterialCostAnalysis,
  selectEfficiencyTrends,
  selectLowStockMaterials,
  selectBatchStatusSummary,

  selectFormValidation,
  selectMaterialFormValidation,
};