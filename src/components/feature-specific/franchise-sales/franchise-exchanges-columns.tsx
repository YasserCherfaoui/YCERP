import FranchiseSalesActionsDropdown from "@/components/feature-specific/franchise-sales/franchise-sales-actions-dropdown";
import {
  createSaleExchangeColumns,
  SaleExchangeRow,
} from "@/components/feature-specific/sales/sale-activity-columns";

export type { SaleExchangeRow };

export const franchiseExchangesColumns = createSaleExchangeColumns((sale) =>
  sale ? <FranchiseSalesActionsDropdown sale={sale} /> : null
);
