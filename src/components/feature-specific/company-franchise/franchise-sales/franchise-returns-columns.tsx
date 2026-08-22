import FranchiseSalesActionsDropdown from "@/components/feature-specific/company-franchise/franchise-sales/franchise-sales-actions-dropdown";
import {
  createSaleReturnColumns,
  SaleReturnRow,
} from "@/components/feature-specific/sales/sale-activity-columns";

export type { SaleReturnRow };

export const franchiseReturnsColumns = createSaleReturnColumns((sale) =>
  sale ? <FranchiseSalesActionsDropdown sale={sale} /> : null
);
