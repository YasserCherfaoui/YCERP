import { Franchise } from "@/models/data/franchise.model";

interface Props {
  franchise: Franchise;
}

export default function ({ franchise }: Props) {
  return (
    <div className="flex gap-4">
      <div className="text-5xl bg-gray-500 w-20 h-20 rounded-3xl  text-center flex justify-center items-center text-white">
        {franchise.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xl">{franchise.name}</span>
        <span className="text-sm">
          {franchise.address}, {franchise.city}, {franchise.state}.
        </span>
      </div>
    </div>
  );
}
