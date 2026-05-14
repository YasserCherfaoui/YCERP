import { RootState } from "@/app/store";
import CompanyProfileSettings from "@/components/feature-specific/company/company-profile-settings";
import CompanySettingsShortcuts from "@/components/feature-specific/company/company-settings-shortcuts";
import VipFranchiseOfferSettings from "@/components/feature-specific/company/vip-franchise-offer-settings";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CompanySettingsPage() {
  const navigate = useNavigate();
  const company = useSelector((state: RootState) => state.company.company);

  if (!company) {
    return null;
  }

  return (
    <div className="flex flex-col gap-10 p-4 md:p-6 max-w-2xl mx-auto w-full pb-16">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate(`/company/${company.ID}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden />
          Back to control panel
        </Button>
      </div>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Company settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Profile, franchise pricing rules, and shortcuts to alerts, messaging, and access.
        </p>
      </header>

      <section className="flex flex-col gap-2" aria-labelledby="company-profile-heading">
        <h2 id="company-profile-heading" className="text-lg font-semibold text-foreground">
          Profile
        </h2>
        <CompanyProfileSettings />
      </section>

      <Separator />

      <section className="flex flex-col gap-2" aria-labelledby="vip-franchise-heading">
        <h2 id="vip-franchise-heading" className="text-lg font-semibold text-foreground">
          VIP franchises
        </h2>
        <VipFranchiseOfferSettings />
      </section>

      <Separator />

      <section className="flex flex-col gap-2" aria-labelledby="shortcuts-heading">
        <h2 id="shortcuts-heading" className="text-lg font-semibold text-foreground">
          Integrations &amp; workspace
        </h2>
        <CompanySettingsShortcuts companyId={company.ID} />
      </section>
    </div>
  );
}
