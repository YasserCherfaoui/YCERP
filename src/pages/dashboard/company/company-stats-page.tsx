import CompanyStatsAppBar from "@/components/feature-specific/company/company-stats/company-stats-app-bar";
import CompanyStatsBody from "@/components/feature-specific/company/company-stats/company-stats-body";

export default function CompanyStatsPage() {
  return (
    <div className="relative isolate min-h-full overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-sky-400/35 blur-3xl dark:bg-sky-500/25" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-rose-400/30 blur-3xl dark:bg-rose-500/20" />
        <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
      </div>
      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <CompanyStatsAppBar />
        <CompanyStatsBody />
      </div>
    </div>
  );
}
