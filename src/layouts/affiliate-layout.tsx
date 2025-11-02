import { useAppDispatch } from "@/app/hooks";
import { AffiliateProBadge } from "@/components/feature-specific/affiliate/affiliate-pro-badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import TelegramIcon from "@/components/ui/telegram-icon";
import { logoutAffiliate } from "@/features/auth/affiliate-slice";
import useAffiliate from "@/hooks/use-affiliate";
import { Menu, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";

const allNavLinks = [
  { to: "/affiliate", label: "Dashboard", end: true, proOnly: false },
  { to: "/affiliate/my-links", label: "My Links", proOnly: false },
  { to: "/affiliate/orders", label: "My Orders", proOnly: true },
  { to: "/affiliate/commissions", label: "Commissions", proOnly: false },
  { to: "/affiliate/payments", label: "Payments", proOnly: false },
  { to: "/affiliate/settings", label: "Settings", proOnly: false },
];

export const AffiliateDashboardLayout = () => {
  const dispatch = useAppDispatch();
  const { affiliate } = useAffiliate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutAffiliate());
  };

  // Filter navigation links based on affiliate pro status
  const navLinks = useMemo(() => {
    const isPro = affiliate?.is_pro || false;
    return allNavLinks.filter(link => !link.proOnly || isPro);
  }, [affiliate?.is_pro]);

  return (
    <div className="affiliate-theme flex min-h-screen w-full bg-background text-foreground">
      <aside
        className="fixed inset-y-0 left-0 z-10 hidden flex-col border-r border-border bg-card sm:flex"
        style={{ width: "240px" }}
      >
        <nav className="flex flex-col gap-2 p-4 flex-1">
          <h2 className="px-2 text-lg font-semibold tracking-tight">
            Affiliate Portal
          </h2>
          
          {/* Pro Affiliate Badge/Banner */}
          {affiliate?.is_pro && (
            <div className="mx-2 mb-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-bold text-amber-900">Pro Affiliate</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                You have access to exclusive features and enhanced commission rates!
              </p>
            </div>
          )}
          
          <div className="mb-2">
            <a
              href="https://t.me/+Rb4xEzrnz-piYzVk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-[#229ED9]/10"
              style={{ color: '#229ED9' }}
            >
              <TelegramIcon className="h-5 w-5" />
              <span>Join our Telegram group</span>
            </a>
          </div>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `relative rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-secondary/50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-primary" />
                  )}
                  {link.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col sm:pl-[240px] w-full">
        <header
          className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-8"
          style={{ height: "64px" }}
        >
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:hidden">
              <SheetHeader>
                <SheetTitle>Affiliate Portal</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {/* Pro Affiliate Badge/Banner for Mobile */}
                {affiliate?.is_pro && (
                  <div className="mx-2 mb-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-bold text-amber-900">Pro Affiliate</span>
                    </div>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      You have access to exclusive features and enhanced commission rates!
                    </p>
                  </div>
                )}
                
                <a
                  href="https://t.me/+Rb4xEzrnz-piYzVk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-[#229ED9]/10"
                  style={{ color: '#229ED9' }}
                >
                  <TelegramIcon className="h-5 w-5" />
                  <span>Join our Telegram group</span>
                </a>
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `relative rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-secondary text-primary"
                          : "text-muted-foreground hover:bg-secondary/50"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-primary" />
                        )}
                        {link.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex-1 sm:flex-initial" />

          {/* Pro Badge in Header */}
          {affiliate?.is_pro && (
            <div className="hidden sm:block">
              <AffiliateProBadge isPro={true} />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="overflow-hidden rounded-full w-8 h-8"
              >
                <span>{affiliate?.full_name?.charAt(0).toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}; 