import { Franchise } from "@/models/data/franchise.model";

interface Props {
  franchise: Franchise;
}

export default function ({ franchise }: Props) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3 pt-2 sm:flex-row sm:items-start sm:gap-4 sm:pt-0">
      <div
        aria-hidden
        className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-2xl font-semibold tabular-nums text-muted-foreground sm:size-16 sm:text-3xl"
      >
        {franchise.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex min-w-0 flex-col gap-1 text-center sm:text-left">
        <span className="text-xl font-semibold leading-tight">{franchise.name}</span>
        <span className="break-words text-sm text-muted-foreground">
          {franchise.address}, {franchise.city}, {franchise.state}.
        </span>
      </div>
    </div>
  );
}
