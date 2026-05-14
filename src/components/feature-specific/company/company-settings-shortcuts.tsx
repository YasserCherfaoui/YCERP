import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BellRing, ChevronRight, MessageSquare, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router-dom";

const links = [
  {
    href: (id: number) => `/company/${id}/whatsapp-settings`,
    title: "WhatsApp",
    description: "Notification templates and phone lists",
    icon: MessageSquare,
  },
  {
    href: (id: number) => `/company/${id}/stock-alerts`,
    title: "Stock alerts",
    description: "Thresholds, notifications, and configuration",
    icon: BellRing,
  },
  {
    href: (id: number) => `/company/${id}/iam`,
    title: "Access & administrators",
    description: "Who can manage this company",
    icon: Users,
  },
  {
    href: (id: number) => `/company/${id}/products`,
    title: "Products",
    description: "Catalog and pricing",
    icon: ShoppingBag,
  },
] as const;

export default function CompanySettingsShortcuts({ companyId }: { companyId: number }) {
  return (
    <Card className="w-full rounded-lg border border-border bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">More in this company</CardTitle>
        <CardDescription>Jump to other areas that behave like settings or company-wide configuration.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {links.map(({ href, title, description, icon: Icon }) => (
          <Button key={title} variant="outline" className="h-auto justify-between gap-3 py-3 px-4" asChild>
            <Link to={href(companyId)}>
              <span className="flex items-start gap-3 text-left">
                <Icon className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground" aria-hidden />
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="block text-sm font-normal text-muted-foreground">{description}</span>
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
