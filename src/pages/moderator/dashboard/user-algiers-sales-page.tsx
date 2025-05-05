import UserSalesAppBar from "@/components/feature-specific/moderator/user-sales/algiers/user-sales-app-bar";
import UserSalesTable from "@/components/feature-specific/moderator/user-sales/algiers/user-sales-table";

export default function () {
  return (
    <div className="flex flex-col gap-4 p-4">
      <UserSalesAppBar />
      <UserSalesTable />
    </div>
  );
}
