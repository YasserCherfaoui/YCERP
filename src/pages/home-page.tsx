import { ModeToggle } from "@/components/common/mode-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Activity,
  ArrowRight,
  BellRing,
  Bike,
  Boxes,
  Building2,
  CalendarClock,
  CircleCheck,
  Crown,
  Database,
  Handshake,
  Layers,
  LogIn,
  Megaphone,
  MessagesSquare,
  Package,
  Radar,
  ReceiptText,
  ScanLine,
  Send,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tags,
  Truck,
  Undo2,
  UserCheck,
  Wallet,
  Webhook,
} from "lucide-react"
import { Link } from "react-router-dom"

const liquidGlass =
  "border border-white/40 bg-white/45 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45),inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-xl dark:border-white/15 dark:bg-white/[0.07] dark:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.16)]"

const liquidGlassSoft =
  "border border-white/40 bg-white/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05]"

const modules = [
  {
    icon: Database,
    title: "Inventory ledger",
    description:
      "Every stock movement is an append-only ledger entry with an idempotency key. Quantities are a rebuildable projection, reconciled and snapshotted daily.",
    tone: "bg-sky-200/80 text-sky-800 dark:bg-sky-400/20 dark:text-sky-100",
  },
  {
    icon: Tags,
    title: "Catalog & promotions",
    description:
      "Products, variants and barcodes with pricing tiers, BOGO, pairable and combinable promos, plus missing-variant requests and variant deposits.",
    tone: "bg-violet-200/80 text-violet-800 dark:bg-violet-400/20 dark:text-violet-100",
  },
  {
    icon: ReceiptText,
    title: "Bills & suppliers",
    description:
      "Entry, exit and stock-movement bills between warehouse and franchises, supplier bills and payments, with printable PDFs.",
    tone: "bg-amber-200/80 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100",
  },
  {
    icon: ScanLine,
    title: "Point of sale",
    description:
      "Warehouse, Algiers and franchise sales with exchanges, known and unknown returns, and broken-item declarations and transfers.",
    tone: "bg-emerald-200/80 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-100",
  },
  {
    icon: Store,
    title: "Franchise network",
    description:
      "Franchise pricing types, VIP offers, commissions and ledgers, pickup requests and ship-from-store fulfillment.",
    tone: "bg-rose-200/80 text-rose-800 dark:bg-rose-400/20 dark:text-rose-100",
  },
  {
    icon: ShoppingBag,
    title: "Online order desk",
    description:
      "WooCommerce and Shopify orders land in one desk for confirmation, assignment, packing checks and export, updated live over WebSocket.",
    tone: "bg-indigo-200/80 text-indigo-800 dark:bg-indigo-400/20 dark:text-indigo-100",
  },
  {
    icon: Truck,
    title: "Delivery & carriers",
    description:
      "Yalidine parcels and labels, NOEST tracking, and your own delivery companies and couriers with collections and payments.",
    tone: "bg-blue-200/80 text-blue-800 dark:bg-blue-400/20 dark:text-blue-100",
  },
  {
    icon: Wallet,
    title: "Expenses",
    description: "Track one-off and recurring expenses by category, with reports per company and per franchise.",
    tone: "bg-teal-200/80 text-teal-800 dark:bg-teal-400/20 dark:text-teal-100",
  },
  {
    icon: Handshake,
    title: "Affiliates & CRM",
    description:
      "Referral attribution, commissions and payouts for affiliates, plus a customer base built from every order and review.",
    tone: "bg-orange-200/80 text-orange-900 dark:bg-orange-400/20 dark:text-orange-100",
  },
  {
    icon: MessagesSquare,
    title: "Support & alerts",
    description:
      "Real-time franchise support chat, issue tickets, stock-level alerts, email and WhatsApp messaging.",
    tone: "bg-fuchsia-200/80 text-fuchsia-800 dark:bg-fuchsia-400/20 dark:text-fuchsia-100",
  },
  {
    icon: Megaphone,
    title: "Ads intelligence",
    description:
      "Meta and TikTok ad sync, UTM attribution to real orders, unit economics and competitor tracking, with an AI assistant.",
    tone: "bg-pink-200/80 text-pink-800 dark:bg-pink-400/20 dark:text-pink-100",
  },
  {
    icon: ShieldCheck,
    title: "Access & identity",
    description:
      "Multi-company tenancy, role-based access for owners, moderators and order managers, and passkey sign-in.",
    tone: "bg-slate-200/80 text-slate-800 dark:bg-slate-400/20 dark:text-slate-100",
  },
]

const lifecycle = [
  {
    label: "Unconfirmed",
    icon: Package,
    description: "Orders arrive from your store webhooks and are assigned to order managers.",
    tone: "border-indigo-200/80 bg-indigo-100/80 text-indigo-950 dark:border-indigo-400/30 dark:bg-indigo-500/20 dark:text-indigo-50",
  },
  {
    label: "Packing",
    icon: Boxes,
    description: "Confirmed with items, carrier and delivery fees. Packing checks scan every unit.",
    tone: "border-blue-200/80 bg-blue-100/80 text-blue-950 dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-50",
  },
  {
    label: "Dispatching",
    icon: Truck,
    description: "Exported to the carrier. Stock is deducted through the ledger.",
    tone: "border-violet-200/80 bg-violet-100/80 text-violet-950 dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-50",
  },
  {
    label: "Delivering",
    icon: Send,
    description: "Carrier statuses sync back by webhook or polling.",
    tone: "border-amber-200/80 bg-amber-100/80 text-amber-950 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-50",
  },
  {
    label: "Delivered",
    icon: CircleCheck,
    description: "Revenue, commissions and statistics update. Returns flow back into stock.",
    tone: "border-emerald-200/80 bg-emerald-100/80 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-50",
  },
]

const integrations = ["WooCommerce", "Shopify", "Yalidine", "NOEST", "Meta Ads", "TikTok Ads", "WhatsApp"]

const automations = [
  { icon: CalendarClock, schedule: "Daily, 02:00", title: "Inventory closing snapshots" },
  { icon: Layers, schedule: "Daily, 06:00", title: "Variant needs from franchise sales" },
  { icon: BellRing, schedule: "Every 6 hours", title: "Stock-alert level checks" },
  { icon: Radar, schedule: "Every 15 minutes", title: "NOEST parcel status polling" },
]

const portals = [
  {
    icon: Crown,
    title: "Company owner",
    description: "Control panel for every company: operations, network, stock, delivery, finance and administration.",
    href: "/login",
    tone: "bg-sky-200/80 text-sky-800 dark:bg-sky-400/20 dark:text-sky-100",
  },
  {
    icon: UserCheck,
    title: "Moderator & order manager",
    description: "Day-to-day warehouse, sales and order desk work, scoped to what each role is allowed to do.",
    href: "/moderator/login",
    tone: "bg-violet-200/80 text-violet-800 dark:bg-violet-400/20 dark:text-violet-100",
  },
  {
    icon: Building2,
    title: "Franchise",
    description: "Store sales, inventory, bills, pickups, ship-from-store orders, expenses and support chat.",
    href: "/myFranchise/login",
    tone: "bg-rose-200/80 text-rose-800 dark:bg-rose-400/20 dark:text-rose-100",
  },
  {
    icon: Handshake,
    title: "Affiliate",
    description: "Referral links, commissions, payouts and, for Pro affiliates, attributed orders.",
    href: "/affiliate/login",
    secondary: { label: "Become an affiliate", href: "/affiliate/register" },
    tone: "bg-amber-200/80 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100",
  },
  {
    icon: Bike,
    title: "Delivery courier",
    description: "Today's assigned orders, deliveries completed and cash collected on the road.",
    href: "/delivery/login",
    tone: "bg-emerald-200/80 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-100",
  },
]

const facts = [
  { value: "5", label: "Role-based portals" },
  { value: "12", label: "Integrated modules" },
  { value: "3", label: "Delivery channels" },
  { value: "1", label: "Append-only stock ledger" },
]

const navLinks = [
  { label: "Modules", href: "#modules" },
  { label: "Order flow", href: "#order-flow" },
  { label: "Portals", href: "#portals" },
]

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 text-base text-muted-foreground">{description}</p>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-sky-400/35 blur-3xl dark:bg-sky-500/25" />
        <div className="absolute -right-16 top-64 h-[28rem] w-[28rem] rounded-full bg-rose-400/30 blur-3xl dark:bg-rose-500/20" />
        <div className="absolute left-1/3 top-[55rem] h-96 w-96 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
        <div className="absolute -left-10 top-[95rem] h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/15" />
        <div className="absolute right-10 top-[130rem] h-96 w-96 rounded-full bg-amber-300/25 blur-3xl dark:bg-amber-500/15" />
      </div>

      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <nav
          aria-label="Main"
          className={cn("mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-2xl px-4 py-2.5", liquidGlass)}
        >
          <Link to="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex size-8 items-center justify-center rounded-lg bg-sky-200/80 text-sky-800 dark:bg-sky-400/20 dark:text-sky-100">
              <Database className="size-4" />
            </span>
            <span className="text-lg font-semibold tracking-tight">My ERP</span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/10"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Button asChild size="sm">
              <Link to="/login">
                <LogIn />
                Sign in
              </Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="text-center lg:text-left">
              <Badge variant="outline" className={cn("mb-6 gap-1.5 rounded-full px-3 py-1 text-xs font-medium", liquidGlassSoft)}>
                <Activity className="size-3.5" />
                Ledger-first ERP for retail, franchises and e-commerce
              </Badge>
              <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Stock, orders, franchises and delivery,{" "}
                <span className="bg-gradient-to-r from-sky-500 via-violet-500 to-rose-500 bg-clip-text text-transparent">
                  on one ledger.
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0">
                My ERP connects your warehouse, franchise stores, online shops and carriers. Every unit that moves is
                recorded once, so the stock you see is the stock you have.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Button asChild size="lg" className="min-w-40">
                  <Link to="/login">
                    Sign in
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className={cn("min-w-40", liquidGlassSoft)}>
                  <a href="#portals">Choose your portal</a>
                </Button>
              </div>
            </div>

            <div className={cn("rounded-3xl p-5 sm:p-6", liquidGlass)} aria-label="Order lifecycle preview">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Order desk</p>
                  <p className="text-lg font-semibold tracking-tight">From webhook to doorstep</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-200/80 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-100">
                  <span className="size-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse" />
                  Live
                </span>
              </div>
              <ol className="space-y-2.5">
                {lifecycle.map((stage) => {
                  const Icon = stage.icon
                  return (
                    <li key={stage.label} className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5", stage.tone)}>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/60 dark:bg-white/10">
                        <Icon className="size-4" />
                      </span>
                      <span className="text-sm font-semibold">{stage.label}</span>
                    </li>
                  )
                })}
              </ol>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-orange-300/80 px-3 py-2 text-xs text-muted-foreground dark:border-orange-400/30">
                <Undo2 className="size-3.5 text-orange-600 dark:text-orange-300" />
                Returns and exchanges re-enter stock through the same ledger.
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6" aria-label="At a glance">
          <dl className={cn("mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-4", liquidGlass)}>
            {facts.map((fact) => (
              <div key={fact.label} className="px-6 py-6 text-center">
                <dt className="sr-only">{fact.label}</dt>
                <dd className="text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">{fact.value}</dd>
                <dd className="mt-1 text-sm text-muted-foreground">{fact.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="modules" className="scroll-mt-24 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Modules"
              title="Everything the business runs on"
              description="Each module writes stock through the same inventory service, so sales, bills, orders and returns never disagree."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => {
                const Icon = module.icon
                return (
                  <article
                    key={module.title}
                    className={cn(
                      "rounded-2xl p-5 motion-safe:transition motion-safe:duration-200 hover:-translate-y-0.5 hover:shadow-lg",
                      liquidGlass
                    )}
                  >
                    <span className={cn("mb-4 flex size-10 items-center justify-center rounded-xl", module.tone)}>
                      <Icon className="size-5" />
                    </span>
                    <h3 className="text-base font-semibold tracking-tight">{module.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{module.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="order-flow" className="scroll-mt-24 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Order flow"
              title="One lifecycle for every online order"
              description="Orders from your stores move through the same stages, whichever carrier ships them or franchise fulfills them."
            />
            <ol className="grid gap-3 md:grid-cols-5">
              {lifecycle.map((stage, index) => {
                const Icon = stage.icon
                return (
                  <li key={stage.label} className={cn("relative rounded-2xl border p-4", stage.tone)}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-white/60 dark:bg-white/10">
                        <Icon className="size-4" />
                      </span>
                      <span className="text-xs font-semibold tabular-nums opacity-60">0{index + 1}</span>
                    </div>
                    <h3 className="text-sm font-semibold">{stage.label}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed opacity-80">{stage.description}</p>
                  </li>
                )
              })}
            </ol>

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              <div className={cn("rounded-2xl p-6", liquidGlass)}>
                <div className="mb-4 flex items-center gap-2">
                  <Webhook className="size-4 text-muted-foreground" />
                  <h3 className="text-base font-semibold tracking-tight">Connected services</h3>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Store webhooks bring orders in, carriers report delivery status back, and ad platforms tie spend to
                  the orders it produced.
                </p>
                <ul className="flex flex-wrap gap-2">
                  {integrations.map((name) => (
                    <li key={name} className={cn("rounded-full px-3 py-1.5 text-sm font-medium", liquidGlassSoft)}>
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn("rounded-2xl p-6", liquidGlass)}>
                <div className="mb-4 flex items-center gap-2">
                  <CalendarClock className="size-4 text-muted-foreground" />
                  <h3 className="text-base font-semibold tracking-tight">Runs on its own</h3>
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {automations.map((job) => {
                    const Icon = job.icon
                    return (
                      <li key={job.title} className={cn("flex items-start gap-3 rounded-xl p-3", liquidGlassSoft)}>
                        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.schedule}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="portals" className="scroll-mt-24 px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionHeading
              eyebrow="Portals"
              title="A workspace for every role"
              description="Each team signs in to its own portal and sees only what it needs."
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              {portals.map((portal, index) => {
                const Icon = portal.icon
                return (
                  <article
                    key={portal.title}
                    className={cn(
                      "flex flex-col rounded-2xl p-6",
                      index < 3 ? "lg:col-span-2" : "lg:col-span-3",
                      liquidGlass
                    )}
                  >
                    <span className={cn("mb-4 flex size-11 items-center justify-center rounded-xl", portal.tone)}>
                      <Icon className="size-5" />
                    </span>
                    <h3 className="text-lg font-semibold tracking-tight">{portal.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{portal.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button asChild>
                        <Link to={portal.href}>
                          Sign in
                          <ArrowRight />
                        </Link>
                      </Button>
                      {portal.secondary && (
                        <Button asChild variant="outline" className={liquidGlassSoft}>
                          <Link to={portal.secondary.href}>{portal.secondary.label}</Link>
                        </Button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 pb-8 pt-12 sm:px-6">
        <div className={cn("mx-auto max-w-6xl rounded-2xl p-6 sm:p-8", liquidGlass)}>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-sky-200/80 text-sky-800 dark:bg-sky-400/20 dark:text-sky-100">
                  <Database className="size-4" />
                </span>
                <span className="text-lg font-semibold tracking-tight">My ERP</span>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                Inventory, sales, franchises, online orders and delivery, managed from one ledger-backed platform.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#modules" className="hover:text-foreground">Modules</a></li>
                <li><a href="#order-flow" className="hover:text-foreground">Order flow</a></li>
                <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold">Sign in</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {portals.map((portal) => (
                  <li key={portal.href}>
                    <Link to={portal.href} className="hover:text-foreground">{portal.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-white/40 pt-6 text-sm text-muted-foreground dark:border-white/10">
            © {new Date().getFullYear()} My ERP. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
