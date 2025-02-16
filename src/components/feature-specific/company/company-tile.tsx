import { Company } from "@/models/data/company.model";

interface Props {
  company: Company;
}

export default function ({ company }: Props) {
  return (
    <div className="flex gap-4">
      <div className="text-5xl bg-gray-500 w-20 h-20 rounded-3xl  text-center flex justify-center items-center text-white">
        {company.company_name.charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xl">{company.company_name}</span>
        <span className="text-sm">{company.address}</span>
      </div>
    </div>
  );
}
