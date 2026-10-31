export default function CrmBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -left-16 top-8 h-72 w-72 rounded-full bg-sky-400/35 blur-3xl dark:bg-sky-500/25" />
      <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-rose-400/30 blur-3xl dark:bg-rose-500/20" />
      <div className="absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
      <div className="absolute bottom-40 right-1/4 h-64 w-64 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/15" />
    </div>
  );
}
