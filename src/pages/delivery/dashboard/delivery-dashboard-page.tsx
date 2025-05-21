import AppBarBackButton from "@/components/common/app-bar-back-button";
import { deliveryEmployeeColumns } from "@/components/feature-specific/delivery/delivery-employee-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DeliveryEmployee } from "@/models/data/delivery.model";
import CreateDeliveryEmployeeDialog from "@/pages/delivery/create-delivery-employee-dialog";
import { getDeliveryCompany, getDeliveryEmployees } from "@/services/delivery-service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";

export default function DeliveryDashboardPage() {
  const params = useParams();
  const companyId = Number(params.id);
  const { data: companyData, isLoading: companyLoading, isError: companyError } = useQuery({
    queryKey: ["delivery-company", companyId],
    queryFn: () => getDeliveryCompany(companyId),
    enabled: !!companyId,
  });
  const { data: employeesData, isLoading: employeesLoading, isError: employeesError } = useQuery({
    queryKey: ["delivery-employees", companyId],
    queryFn: () => getDeliveryEmployees(companyId),
    enabled: !!companyId,
  });
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const company = companyData?.data ?? null;
  const employees: DeliveryEmployee[] = employeesData?.data || [];

  return (
    <div className="p-4">
      {/* App Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <AppBarBackButton destination="Delivery" />
          <span className="text-2xl font-bold">{company ? company.name : "Delivery Company"}</span>
        </div>
        <Button onClick={() => setEmployeeDialogOpen(true)}>Add Employee</Button>
      </div>
      <CreateDeliveryEmployeeDialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen} company={company} />
      {/* DataTable */}
      {companyLoading && <div>Loading company...</div>}
      {companyError && <div>Error loading company.</div>}
      {employeesLoading && <div>Loading employees...</div>}
      {employeesError && <div>Error loading employees.</div>}
      {!employeesLoading && !employeesError && (
        <DataTable columns={deliveryEmployeeColumns} data={employees} searchColumn="name" />
      )}
    </div>
  );
} 