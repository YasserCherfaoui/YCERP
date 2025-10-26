import { useAppDispatch } from "@/app/hooks";
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
import { Menu } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/my-links", label: "My Links" },
  { to: "/commissions", label: "Commissions" },
  { to: "/payments", label: "Payments" },
  { to: "/settings", label: "Settings" },
];

export const AffiliateDashboardLayout = () => {
  const dispatch = useAppDispatch();
  const { affiliate } = useAffiliate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutAffiliate());
  };

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