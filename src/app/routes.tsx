import FranchisePrivateRoute from "@/components/feature-specific/franchise-private-route";
import FranchisePublicRoute from "@/components/feature-specific/franchise-public-route";
import PrivateRoute from "@/components/feature-specific/private-route";
import PublicRoute from "@/components/feature-specific/public-route";
import SuperFranchiseRoute from "@/components/feature-specific/super-franchise-route";
import CompanyLayout from "@/layouts/company-layout";
import DashboardLayout from "@/layouts/dashboard-layout";
import MainLayout from "@/layouts/main-layout";
import LoginPage from "@/pages/auth/login-page";
import RegisterPage from "@/pages/auth/register-page";
import CompanyAlgiersSalesPage from "@/pages/dashboard/company/company-algiers-sales-page";
import CompanyBillsPage from "@/pages/dashboard/company/company-bills-page";
import CompanyControlPanelPage from "@/pages/dashboard/company/company-control-panel-page";
import CompanyFranchiseBillsPage from "@/pages/dashboard/company/company-franchise-bills-page";
import CompanyFranchiseInventoryPage from "@/pages/dashboard/company/company-franchise-inventory-page";
import CompanyFranchisePage from "@/pages/dashboard/company/company-franchise-page";
import CompanyFranchiseSalesPage from "@/pages/dashboard/company/company-franchise-sales-page";
import CompanyFranchisesPage from "@/pages/dashboard/company/company-franchises-page";
import CompanyPage from "@/pages/dashboard/company/company-page";
import CompanyProductsPage from "@/pages/dashboard/company/company-products-page";
import CompanySalesPage from "@/pages/dashboard/company/company-sales-page";
import CompanySalesSwitchPage from "@/pages/dashboard/company/company-sales-switch-page";
import CompanyStatsPage from "@/pages/dashboard/company/company-stats-page";
import CompanySupplierPage from "@/pages/dashboard/company/company-supplier-page";
import CompanySuppliersPage from "@/pages/dashboard/company/company-suppliers-page";
import CompanyUnknownReturnsPage from "@/pages/dashboard/company/company-unknown-returns-page";
import IamPage from "@/pages/dashboard/company/iam-page";
import WarehousePage from "@/pages/dashboard/company/warehouse-page";
import DashboardPage from "@/pages/dashboard/dashboard-page";
import MenuPage from "@/pages/dashboard/menu-page";
import FranchiseLoginPage from "@/pages/franchise/auth/franchise-login-page";
import FranchiseBillsPage from "@/pages/franchise/dashboard/franchise-bills-page";
import FranchiseInventoryPage from "@/pages/franchise/dashboard/franchise-inventory-page";
import FranchiseMenuPage from "@/pages/franchise/dashboard/franchise-menu-page";
import FranchiseProductsPage from "@/pages/franchise/dashboard/franchise-products-page";
import FranchiseSalesPage from "@/pages/franchise/dashboard/franchise-sales-page";
import HomePage from "@/pages/home-page";
import { Route, Routes } from "react-router-dom";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
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
          </Route>
        </Route>
        //! WARNING: PRIVATE ROUTES
        <Route element={<PrivateRoute />}>
          // ANCHOR: DASHBOARD PAGES
          <Route path="/menu" element={<MenuPage />} />
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
                </Route>
              </Route>
              <Route path="warehouse" element={<WarehousePage />} />
              <Route path="products" element={<CompanyProductsPage />} />
              <Route path="bills" element={<CompanyBillsPage />} />
              <Route path="suppliers">
                <Route index element={<CompanySuppliersPage />} />
                <Route path=":supplierID" element={<CompanySupplierPage />} />
              </Route>

              <Route path="sales">
                <Route index element={<CompanySalesSwitchPage />} />
                <Route path="warehouse" element={<CompanySalesPage />} />
                <Route path="algiers" element={<CompanyAlgiersSalesPage />} />
              </Route>
              <Route
                path="unknown-returns"
                element={<CompanyUnknownReturnsPage />}
              />
              <Route path="statistics" element={<CompanyStatsPage />} />
              <Route path="iam" element={<IamPage />} />
            </Route>
          </Route>
          <Route path="/franchise" element={<MenuPage />} />
          <Route path="/inventory" element={<MenuPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
