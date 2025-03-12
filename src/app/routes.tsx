import FranchisePrivateRoute from "@/components/feature-specific/franchise-private-route";
import FranchisePublicRoute from "@/components/feature-specific/franchise-public-route";
import PrivateRoute from "@/components/feature-specific/private-route";
import PublicRoute from "@/components/feature-specific/public-route";
import CompanyLayout from "@/layouts/company-layout";
import DashboardLayout from "@/layouts/dashboard-layout";
import MainLayout from "@/layouts/main-layout";
import LoginPage from "@/pages/auth/login-page";
import RegisterPage from "@/pages/auth/register-page";
import CompanyBillsPage from "@/pages/dashboard/company/company-bills-page";
import CompanyControlPanelPage from "@/pages/dashboard/company/company-control-panel-page";
import CompanyFranchisesPage from "@/pages/dashboard/company/company-franchises-page";
import CompanyPage from "@/pages/dashboard/company/company-page";
import CompanyProductsPage from "@/pages/dashboard/company/company-products-page";
import CompanySalesPage from "@/pages/dashboard/company/company-sales-page";
import CompanySupplierPage from "@/pages/dashboard/company/company-supplier-page";
import CompanySuppliersPage from "@/pages/dashboard/company/company-suppliers-page";
import WarehousePage from "@/pages/dashboard/company/warehouse-page";
import DashboardPage from "@/pages/dashboard/dashboard-page";
import MenuPage from "@/pages/dashboard/menu-page";
import FranchiseLoginPage from "@/pages/franchise/auth/franchise-login-page";
import FranchiseBillsPage from "@/pages/franchise/dashboard/franchise-bills-page";
import FranchiseInventoryPage from "@/pages/franchise/dashboard/franchise-inventory-page";
import FranchiseMenuPage from "@/pages/franchise/dashboard/franchise-menu-page";
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
              <Route path="franchises" element={<CompanyFranchisesPage />} />
              <Route path="warehouse" element={<WarehousePage />} />
              <Route path="products" element={<CompanyProductsPage />} />
              <Route path="bills" element={<CompanyBillsPage />} />
              <Route path="suppliers" element={<CompanySuppliersPage />} />
              <Route path="sales" element={<CompanySalesPage />} />
              <Route path="suppliers/:supplierID" element={<CompanySupplierPage />} />

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
