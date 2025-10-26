import AffiliatePrivateRoute from "@/components/feature-specific/affiliate/affiliate-private-route";
import AffiliatePublicRoute from "@/components/feature-specific/affiliate/affiliate-public-route";
import { AffiliateDashboardLayout } from "@/layouts/affiliate-layout";

import MainLayout from "@/layouts/main-layout";
import { AffiliateForgotPasswordPage } from "@/pages/affiliate/auth/affiliate-forgot-password-page";
import { AffiliateLoginPage } from "@/pages/affiliate/auth/affiliate-login-page";
import { AffiliateRegisterPage } from "@/pages/affiliate/auth/affiliate-register-page";
import AffiliateCommissionsPage from "@/pages/affiliate/dashboard/affiliate-commissions-page";
import { AffiliateDashboardPage } from "@/pages/affiliate/dashboard/affiliate-dashboard-page";
import AffiliateMyLinksPage from "@/pages/affiliate/dashboard/affiliate-my-links-page";
import AffiliatePaymentsPage from "@/pages/affiliate/dashboard/affiliate-payments-page";
import AffiliateSettingsPage from "@/pages/affiliate/dashboard/affiliate-settings-page";

import NotFoundPage from "@/pages/not-found-page";
import { Route, Routes } from "react-router-dom";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        
        <Route path="*" element={<NotFoundPage />} />
        {/* Affiliate Routes */}
        <Route path="/">
          <Route element={<AffiliatePublicRoute />}>
            <Route path="login" element={<AffiliateLoginPage />} />
            <Route path="register" element={<AffiliateRegisterPage />} />
            <Route path="forgot-password" element={<AffiliateForgotPasswordPage />} />
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
    
      </Route>
    </Routes>
  );
}
