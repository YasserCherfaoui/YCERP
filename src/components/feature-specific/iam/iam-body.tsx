import { RootState } from "@/app/store";
import { usersColumns } from "@/components/feature-specific/iam/users_columns";
import { DataTable } from "@/components/ui/data-table";
import { getUsersByCompany } from "@/services/user-service";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

export default function () {
  const company = useSelector((state: RootState) => state.company.company);
  const { data: users } = useQuery({
    queryKey: ["iam", company?.ID ?? 0],
    queryFn: () => getUsersByCompany(company?.ID ?? 0),
    enabled: !!company,
  });
  return (
    <div>
      <DataTable
        columns={usersColumns}
        data={users?.data ?? []}
        searchColumn="full_name"
      />
    </div>
  );
}
