import AffiliatePrivateRoute from "@/components/feature-specific/affiliate/affiliate-private-route";
import AffiliatePublicRoute from "@/components/feature-specific/affiliate/affiliate-public-route";
import DeliveryPrivateRoute from "@/components/feature-specific/delivery-employee/delivery-private-route";
import DeliveryPublicRoute from "@/components/feature-specific/delivery-employee/delivery-public-route";
import FranchisePrivateRoute from "@/components/feature-specific/franchise-private-route";
import FranchisePublicRoute from "@/components/feature-specific/franchise-public-route";
import UserPrivateRoute from "@/components/feature-specific/moderator/user-private-route";
import UserPublicRoute from "@/components/feature-specific/moderator/user-public-route";
import PrivateRoute from "@/components/feature-specific/private-route";
import PublicRoute from "@/components/feature-specific/public-route";
import SuperFranchiseRoute from "@/components/feature-specific/super-franchise-route";
import { AffiliateDashboardLayout } from "@/layouts/affiliate-layout";
import CompanyLayout from "@/layouts/company-layout";
import DashboardLayout from "@/layouts/dashboard-layout";
import MainLayout from "@/layouts/main-layout";
import { AffiliateLoginPage } from "@/pages/affiliate/auth/affiliate-login-page";
import { AffiliateRegisterPage } from "@/pages/affiliate/auth/affiliate-register-page";
import AffiliateCommissionsPage from "@/pages/affiliate/dashboard/affiliate-commissions-page";
import { AffiliateDashboardPage } from "@/pages/affiliate/dashboard/affiliate-dashboard-page";
import AffiliateMyLinksPage from "@/pages/affiliate/dashboard/affiliate-my-links-page";
import AffiliatePaymentsPage from "@/pages/affiliate/dashboard/affiliate-payments-page";
import AffiliateSettingsPage from "@/pages/affiliate/dashboard/affiliate-settings-page";
import LoginPage from "@/pages/auth/login-page";
import RegisterPage from "@/pages/auth/register-page";
import CompanyFranchiseStatsPage from "@/pages/company-franchise-stats-page";
import AdvertisingPage from "@/pages/dashboard/company/advertising-page";
import BoxingPage from "@/pages/dashboard/company/boxing-page";
import ChargesPage from "@/pages/dashboard/company/charges-page";
import CompanyAffiliateApplicationsPage from "@/pages/dashboard/company/company-affiliate-applications-page";
import CompanyAffiliateDetailsPage from "@/pages/dashboard/company/company-affiliate-details-page";
import CompanyAffiliatesPage from "@/pages/dashboard/company/company-affiliates-page";
import CompanyAlgiersSalesPage from "@/pages/dashboard/company/company-algiers-sales-page";
import CompanyBillsPage from "@/pages/dashboard/company/company-bills-page";
import CompanyControlPanelPage from "@/pages/dashboard/company/company-control-panel-page";
import CompanyFranchiseBillsPage from "@/pages/dashboard/company/company-franchise-bills-page";
import CompanyFranchiseInventoryPage from "@/pages/dashboard/company/company-franchise-inventory-page";
import CompanyFranchisePage from "@/pages/dashboard/company/company-franchise-page";
import CompanyFranchiseSalesPage from "@/pages/dashboard/company/company-franchise-sales-page";
import CompanyFranchisesPage from "@/pages/dashboard/company/company-franchises-page";
import CompanyInventoryAnalyticsPage from "@/pages/dashboard/company/company-inventory-analytics-page";
import CompanyMissingVariantsPage from "@/pages/dashboard/company/company-missing-variants-page";
import CompanyOrdersPage from "@/pages/dashboard/company/company-orders-page";
import CompanyPage from "@/pages/dashboard/company/company-page";
import CompanyProductsPage from "@/pages/dashboard/company/company-products-page";
import CompanySalesPage from "@/pages/dashboard/company/company-sales-page";
import CompanySalesSwitchPage from "@/pages/dashboard/company/company-sales-switch-page";
import CompanyStatsPage from "@/pages/dashboard/company/company-stats-page";
import CompanyStockAlertsConfigPage from "@/pages/dashboard/company/company-stock-alerts-config-page";
import CompanyStockAlertsHistoryPage from "@/pages/dashboard/company/company-stock-alerts-history-page";
import CompanyStockAlertsNotificationsPage from "@/pages/dashboard/company/company-stock-alerts-notifications-page";
import CompanyStockAlertsPage from "@/pages/dashboard/company/company-stock-alerts-page";
import CompanySupplierPage from "@/pages/dashboard/company/company-supplier-page";
import CompanySuppliersPage from "@/pages/dashboard/company/company-suppliers-page";
import CompanyUnknownReturnsPage from "@/pages/dashboard/company/company-unknown-returns-page";
import ExchangeRatesPage from "@/pages/dashboard/company/exchange-rates-page";
import ExpensesPage from "@/pages/dashboard/company/expenses-page";
import ExpensesRecurringPage from "@/pages/dashboard/company/expenses-recurring-page";
import ExpensesReportsPage from "@/pages/dashboard/company/expenses-reports-page";
import IamPage from "@/pages/dashboard/company/iam-page";
import IssuesPage from "@/pages/dashboard/company/issues-page";
import OrderTicketsPage from "@/pages/dashboard/company/order-tickets-page";
import RentUtilitiesPage from "@/pages/dashboard/company/rent-utilities-page";
import ReturnsPage from "@/pages/dashboard/company/returns-page";
import SalariesPage from "@/pages/dashboard/company/salaries-page";
import ShippingPage from "@/pages/dashboard/company/shipping-page";
import WarehousePage from "@/pages/dashboard/company/warehouse-page";
import DashboardPage from "@/pages/dashboard/dashboard-page";
import MenuPage from "@/pages/dashboard/menu-page";
import QuickActionsPage from "@/pages/dashboard/quick-actions-page";
import DeliveryDashboardPage from "@/pages/delivery/dashboard/delivery-dashboard-page";
import DeliveryEmployeeDashboardPage from "@/pages/delivery/delivery-employee-dashboard-page";
import DeliveryListPage from "@/pages/delivery/delivery-list-page";
import DeliveryLoginPage from "@/pages/delivery/delivery-login-page";
import FeaturesPage from "@/pages/features";
import FranchiseLoginPage from "@/pages/franchise/auth/franchise-login-page";
import FranchiseBillsPage from "@/pages/franchise/dashboard/franchise-bills-page";
import FranchiseInventoryPage from "@/pages/franchise/dashboard/franchise-inventory-page";
import FranchiseMenuPage from "@/pages/franchise/dashboard/franchise-menu-page";
import FranchiseMissingVariantsPage from "@/pages/franchise/dashboard/franchise-missing-variants-page";
import FranchiseProductsPage from "@/pages/franchise/dashboard/franchise-products-page";
import FranchiseSalesPage from "@/pages/franchise/dashboard/franchise-sales-page";
import FranchiseStockAlertsConfigPage from "@/pages/franchise/dashboard/franchise-stock-alerts-config-page";
import FranchiseStockAlertsHistoryPage from "@/pages/franchise/dashboard/franchise-stock-alerts-history-page";
import FranchiseStockAlertsNotificationsPage from "@/pages/franchise/dashboard/franchise-stock-alerts-notifications-page";
import FranchiseStockAlertsPage from "@/pages/franchise/dashboard/franchise-stock-alerts-page";
import HomePage from "@/pages/home-page";
import UserLoginPage from "@/pages/moderator/auth/login-page";
import ModeratorMobilePage from "@/pages/moderator/dashboard/moderator-mobile-page";
import ModeratorStockAlertsHistoryPage from "@/pages/moderator/dashboard/moderator-stock-alerts-history-page";
import ModeratorStockAlertsNotificationsPage from "@/pages/moderator/dashboard/moderator-stock-alerts-notifications-page";
import ModeratorStockAlertsPage from "@/pages/moderator/dashboard/moderator-stock-alerts-page";
import UserAlgiersSalesPage from "@/pages/moderator/dashboard/user-algiers-sales-page";
import UserMenuPage from "@/pages/moderator/dashboard/user-menu-page";
import UserSalesPage from "@/pages/moderator/dashboard/user-sales-page";
import ModFranchiseRoute from "@/pages/moderator/mod-franchise-route";
import NotFoundPage from "@/pages/not-found-page";
import { Route, Routes } from "react-router-dom";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        // ANCHOR: AUTH PAGES
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        //! MY FRANCHISE ROUTES
        <Route path={"/myFranchise"}>
          <Route element={<FranchisePublicRoute />}>
            <Route path="login" element={<FranchiseLoginPage />} />
          </Route>
          //! FRANCHISE PRIVATE ROUTES
          <Route element={<FranchisePrivateRoute />}>
            <Route index element={<FranchiseMenuPage />} />
            <Route path="sales" element={<FranchiseSalesPage />} />
            <Route path="bills" element={<FranchiseBillsPage />} />
            <Route path="inventory" element={<FranchiseInventoryPage />} />
            <Route path="products" element={<FranchiseProductsPage />} />
            <Route path="missing-variants" element={<FranchiseMissingVariantsPage />} />
            <Route path="statistics" element={<CompanyFranchiseStatsPage />} />
            <Route path="stock-alerts">
              <Route index element={<FranchiseStockAlertsPage />} />
              <Route path="history" element={<FranchiseStockAlertsHistoryPage />} />
              <Route path="config" element={<FranchiseStockAlertsConfigPage />} />
              <Route path="notifications" element={<FranchiseStockAlertsNotificationsPage />} />
            </Route>
          </Route>
        </Route>
        //? USER ROUTES
        <Route path="moderator">
          <Route element={<UserPublicRoute />}>
            <Route path="login" element={<UserLoginPage />} />
          </Route>
          <Route element={<UserPrivateRoute />}>
            <Route index element={<UserMenuPage />} />
            <Route path="orders" element={<CompanyOrdersPage />} />
            <Route path="sales">
              <Route index element={<CompanySalesSwitchPage />} />
              <Route path="warehouse" element={<UserSalesPage />} />
              <Route path="algiers" element={<UserAlgiersSalesPage />} />
            </Route>
            <Route path="warehouse" element={<WarehousePage />} />
            <Route path="bills" element={<CompanyBillsPage />} />
            <Route path="suppliers">
              <Route index element={<CompanySuppliersPage />} />
              <Route path=":supplierID" element={<CompanySupplierPage />} />
            </Route>
            <Route
              path="unknown-returns"
              element={<CompanyUnknownReturnsPage />}
            />
            <Route path="advertising" element={<AdvertisingPage />} />
            <Route path="charges" element={<ChargesPage />} />
            <Route path="exchange-rates" element={<ExchangeRatesPage />} />
            <Route path="boxing" element={<BoxingPage />} />
            <Route path="rent-utilities" element={<RentUtilitiesPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="salaries" element={<SalariesPage />} />
            <Route path="shipping" element={<ShippingPage />} />
            <Route path="products" element={<CompanyProductsPage />} />
            <Route path="mobile" element={<ModeratorMobilePage />} />
            <Route path="franchises">
              <Route index element={<CompanyFranchisesPage />} />
              <Route path=":franchiseID" element={<ModFranchiseRoute />}>
                <Route index element={<CompanyFranchisePage />} />
                <Route path="sales" element={<CompanyFranchiseSalesPage />} />
                <Route path="bills" element={<CompanyFranchiseBillsPage />} />
                <Route
                  path="inventory"
                  element={<CompanyFranchiseInventoryPage />}
                />
                <Route path="statistics" element={<CompanyFranchiseStatsPage />} />
              </Route>

            </Route>
            <Route path="order-tickets" element={<OrderTicketsPage />} />
            <Route path="missing-variants" element={<CompanyMissingVariantsPage />} />
            <Route path="delivery">
              <Route index element={<DeliveryListPage />} />
              <Route path=":id" element={<DeliveryDashboardPage />} />
            </Route>
            <Route path="stock-alerts">
              <Route index element={<ModeratorStockAlertsPage />} />
              <Route path="history" element={<ModeratorStockAlertsHistoryPage />} />
              <Route path="notifications" element={<ModeratorStockAlertsNotificationsPage />} />
            </Route>
          </Route>
          <Route path="issues" element={<IssuesPage />} />
        </Route>
        //! WARNING: PRIVATE ROUTES
        <Route element={<PrivateRoute />}>
          // ANCHOR: DASHBOARD PAGES
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/quick-actions" element={<QuickActionsPage />} />
          <Route path="/company">
            <Route index element={<CompanyPage />} />
            <Route path=":companyID" element={<CompanyLayout />}>
              <Route index element={<CompanyControlPanelPage />} />
              <Route path="franchises">
                <Route index element={<CompanyFranchisesPage />} />
                <Route path=":franchiseID" element={<SuperFranchiseRoute />}>
                  <Route index element={<CompanyFranchisePage />} />
                  <Route path="sales" element={<CompanyFranchiseSalesPage />} />
                  <Route path="bills" element={<CompanyFranchiseBillsPage />} />
                  <Route
                    path="inventory"
                    element={<CompanyFranchiseInventoryPage />}
                  />
                  <Route
                    path="statistics"
                    element={<CompanyFranchiseStatsPage />}
                  />
                </Route>
              </Route>
              <Route path="warehouse" element={<WarehousePage />} />
              <Route path="products" element={<CompanyProductsPage />} />
              <Route path="bills" element={<CompanyBillsPage />} />
              <Route path="suppliers">
                <Route index element={<CompanySuppliersPage />} />
                <Route path=":supplierID" element={<CompanySupplierPage />} />
              </Route>
              <Route path="orders" element={<CompanyOrdersPage />} />
              <Route path="sales">
                <Route index element={<CompanySalesSwitchPage />} />
                <Route path="warehouse" element={<CompanySalesPage />} />
                <Route path="algiers" element={<CompanyAlgiersSalesPage />} />
              </Route>
              <Route
                path="unknown-returns"
                element={<CompanyUnknownReturnsPage />}
              />
              <Route path="charges" element={<ChargesPage />} />
              <Route path="exchange-rates" element={<ExchangeRatesPage />} />
              <Route path="advertising" element={<AdvertisingPage />} />
              <Route path="boxing" element={<BoxingPage />} />
              <Route path="rent-utilities" element={<RentUtilitiesPage />} />
              <Route path="returns" element={<ReturnsPage />} />
              <Route path="salaries" element={<SalariesPage />} />
              <Route path="shipping" element={<ShippingPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="expenses/recurring" element={<ExpensesRecurringPage />} />
              <Route path="expenses/reports" element={<ExpensesReportsPage />} />
              <Route path="statistics" element={<CompanyStatsPage />} />
              <Route path="iam" element={<IamPage />} />
              <Route
                path="inventory-analytics"
                element={<CompanyInventoryAnalyticsPage />}
              />
              <Route path="issues" element={<IssuesPage />} />
              <Route path="delivery">
                <Route index element={<DeliveryListPage />} />
                <Route path=":id" element={<DeliveryDashboardPage />} />
              </Route>
              <Route path="order-tickets" element={<OrderTicketsPage />} />
              <Route path="missing-variants" element={<CompanyMissingVariantsPage />} />
              <Route path="affiliates">
                <Route index element={<CompanyAffiliatesPage />} />
                <Route path=":affiliateID" element={<CompanyAffiliateDetailsPage />} />
              </Route>
              <Route path="affiliate-applications" element={<CompanyAffiliateApplicationsPage />} />
              <Route path="stock-alerts">
                <Route index element={<CompanyStockAlertsPage />} />
                <Route path="history" element={<CompanyStockAlertsHistoryPage />} />
                <Route path="config" element={<CompanyStockAlertsConfigPage />} />
                <Route path="notifications" element={<CompanyStockAlertsNotificationsPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="/franchise" element={<MenuPage />} />
          <Route path="/inventory" element={<MenuPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
        {/* Affiliate Routes */}
        <Route path="/affiliate">
          <Route element={<AffiliatePublicRoute />}>
            <Route path="login" element={<AffiliateLoginPage />} />
            <Route path="register" element={<AffiliateRegisterPage />} />
          </Route>
          <Route element={<AffiliatePrivateRoute />}>
            <Route element={<AffiliateDashboardLayout />}>
              <Route index element={<AffiliateDashboardPage />} />
              <Route path="my-links" element={<AffiliateMyLinksPage />} />
              <Route path="commissions" element={<AffiliateCommissionsPage />} />
              <Route path="payments" element={<AffiliatePaymentsPage />} />
              <Route path="settings" element={<AffiliateSettingsPage />} />
              {/* Add other affiliate dashboard pages here */}
            </Route>
          </Route>
        </Route>
        // ANCHOR: DELIVERY ROUTES
        <Route path="/delivery">
          // ! PRIVATE ROUTES
          <Route element={<DeliveryPrivateRoute />}>
            <Route index element={<DeliveryEmployeeDashboardPage />} />
          </Route>
          // ? PUBLIC ROUTES
          <Route element={<DeliveryPublicRoute />}>
            <Route path="login" element={<DeliveryLoginPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
