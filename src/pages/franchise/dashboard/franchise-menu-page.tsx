import FranchiseMenu from "@/components/feature-specific/franchise-dashboard/franchise-menu";

export default function FranchiseMenuPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-3 pb-[max(6rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-8">
      <FranchiseMenu />
    </main>
  );
}
