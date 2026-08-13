import { Franchise } from "@/models/data/franchise.model";

interface Props {
  franchise: Franchise;
}

export default function ({ franchise }: Props) {
  return (
    <div className="flex min-w-0 items-start gap-3 px-2 sm:gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gray-500 text-center text-3xl text-white sm:h-20 sm:w-20 sm:text-5xl">
        {franchise.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-lg sm:text-xl">{franchise.name}</span>
        <span className="text-sm">
          {franchise.address}, {franchise.city}, {franchise.state}.
        </span>
      </div>
    </div>
  );
}
