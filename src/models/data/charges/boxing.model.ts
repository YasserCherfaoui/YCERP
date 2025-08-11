// Boxing and packaging charge model
import { Product, ProductVariant } from "@/models/data/product.model";
import { BaseCharge } from "./charge.model";

export interface BoxingCharge extends BaseCharge {
  type: "boxing";
  
  // Product association
  product_id?: number;
  product?: Product;
  product_variant_id?: number;
  product_variant?: ProductVariant;
  
  // Batch information
  batch_id?: string;
  batch_size: number; // Number of items packaged
  packaging_date: string | Date;
  
  // Material costs
  materials_used: PackagingMaterial[];
  total_material_cost: number;
  
  // Labor costs
  labor_hours: number;
  labor_rate_per_hour: number;
  total_labor_cost: number;
  workers_count: number;
  
  // Packaging specifications
  packaging_type: "standard" | "custom" | "gift" | "bulk" | "fragile";
  packaging_size: "small" | "medium" | "large" | "extra_large" | "custom";
  custom_dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "inch";
  };
  
  // Quality control
  quality_check_passed: boolean;
  quality_notes?: string;
  defect_rate?: number; // percentage
  rework_required: boolean;
  
  // Efficiency metrics
  items_per_hour: number;
  packaging_efficiency: number; // percentage
  material_waste: number; // amount of wasted material
  waste_percentage: number;
  
  // Cost breakdown
  cost_per_item: number;
  material_cost_percentage: number;
  labor_cost_percentage: number;
  overhead_cost?: number;
  
  // Supplier information (for materials)
  primary_supplier_id?: number;
  supplier_invoice_reference?: string;
  
  // Inventory impact
  inventory_location?: string;
  packaging_location?: string;
  finished_goods_location?: string;
  
  // Special requirements
  fragile_handling: boolean;
  temperature_controlled: boolean;
  moisture_protection: boolean;
  special_instructions?: string;
  
  // Performance tracking
  target_cost_per_item?: number;
  cost_variance?: number;
  target_completion_time?: number; // hours
  actual_completion_time?: number; // hours
}

// Packaging material model
export interface PackagingMaterial {
  ID: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  name: string;
  type: string; // Changed from material_type to type
  unit_cost: number; // Changed from cost_per_unit to unit_cost
  unit_size: string; // Changed from unit_of_measure to unit_size
  description?: string;
  is_active?: boolean;
  
  // Legacy fields for backward compatibility
  material_type?: "box" | "bubble_wrap" | "tape" | "label" | "insert" | "padding" | "bag" | "other";
  unit_of_measure?: "piece" | "meter" | "kg" | "roll" | "sheet";
  cost_per_unit?: number;
  quantity_used?: number;
  total_cost?: number;
  supplier_id?: number;
  sku?: string;
  
  // Material specifications
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
    unit: "cm" | "mm" | "inch";
  };
  
  // Quality specifications
  quality_grade?: "standard" | "premium" | "economy";
  recyclable?: boolean;
  biodegradable?: boolean;
  food_safe?: boolean;
  
  // Inventory tracking
  current_stock?: number;
  minimum_stock?: number;
  reorder_point?: number;
  last_restocked?: string;
  
  // Cost tracking
  average_cost?: number;
  last_purchase_cost?: number;
  price_trend?: "increasing" | "decreasing" | "stable";
}

// Packaging template for standardized packaging
export interface PackagingTemplate {
  ID: number;
  name: string;
  description?: string;
  product_category?: string;
  
  // Template specifications
  packaging_type: string;
  packaging_size: string;
  materials: PackagingTemplateMaterial[];
  estimated_cost: number;
  estimated_time: number; // minutes
  
  // Instructions
  step_by_step_instructions?: string[];
  special_notes?: string;
  quality_checkpoints?: string[];
  
  // Usage tracking
  usage_count: number;
  last_used: string;
  is_active: boolean;
  created_by_id: number;
}

export interface PackagingTemplateMaterial {
  material_id: number;
  material: PackagingMaterial;
  quantity_needed: number;
  is_optional: boolean;
  usage_notes?: string;
}

// Packaging batch for bulk operations
export interface PackagingBatch {
  ID: string;
  batch_name: string;
  batch_date: string;
  total_items: number;
  total_cost: number;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  
  // Batch details
  products: PackagingBatchProduct[];
  assigned_workers: number[];
  start_time?: string;
  end_time?: string;
  completion_percentage: number;
  
  // Quality metrics
  overall_quality_score: number;
  defect_count: number;
  rework_count: number;
  
  // Performance metrics
  planned_duration: number; // hours
  actual_duration?: number; // hours
  efficiency_score: number;
  
  created_by_id: number;
  supervised_by_id?: number;
}

export interface PackagingBatchProduct {
  product_id: number;
  product_variant_id?: number;
  quantity: number;
  packaging_template_id?: number;
  special_instructions?: string;
  priority: "low" | "medium" | "high";
  completed_quantity: number;
  status: "pending" | "in_progress" | "completed";
}

// Material usage analytics
export interface MaterialUsageAnalytics {
  material_id: number;
  period_start: string;
  period_end: string;
  total_quantity_used: number;
  total_cost: number;
  average_cost_per_unit: number;
  usage_trend: "increasing" | "decreasing" | "stable";
  waste_percentage: number;
  efficiency_score: number;
  reorder_recommendations?: string[];
}