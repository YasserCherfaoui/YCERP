import AppBarBackButton from "@/components/common/app-bar-back-button";
import CreateDeliveryCompanyDialog from "@/components/feature-specific/delivery/CreateDeliveryCompanyDialog";
import CreateDeliveryEmployeeDialog from "@/components/feature-specific/delivery/CreateDeliveryEmployeeDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { DeliveryCompany } from "@/models/data/delivery.model";
import { getDeliveryCompanies } from "@/services/delivery-service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function DeliveryListPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["delivery-companies"],
    queryFn: getDeliveryCompanies,
  });
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<DeliveryCompany | null>(null);

  return (
    <div className="p-4">
      {/* App Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 items-center">
          <AppBarBackButton destination="Menu" />
          <h1 className="text-2xl font-bold">Delivery Companies</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCompanyDialogOpen(true)}>
            New Company
          </Button>
          <Button
            onClick={() => setEmployeeDialogOpen(true)}
            disabled={!selectedCompany}
          >
            New Employee
          </Button>
        </div>
      </div>
      {/* Dialogs */}
      <CreateDeliveryCompanyDialog
        open={companyDialogOpen}
        onOpenChange={setCompanyDialogOpen}
      />
      <CreateDeliveryEmployeeDialog
        open={employeeDialogOpen}
        onOpenChange={setEmployeeDialogOpen}
        company={selectedCompany}
      />
      {/* Body */}
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error loading companies.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data?.map((company: DeliveryCompany) => (
          <Card key={company.ID} className="p-4 flex flex-col gap-2">
            <CardTitle className="text-xl flex justify-between items-center">
              {company.name}
            </CardTitle>
            <CardContent className="p-0">
              <div className="flex gap-2">
                <span className="font-bold">ID:</span> {company.ID}
              </div>
              <div className="flex gap-2">
                <span className="font-bold">Created:</span>{" "}
                {new Date(company.CreatedAt).toLocaleDateString()}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end p-0 gap-2">
              <Button onClick={() => navigate(`${company.ID}`)}>
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCompany(company);
                  setEmployeeDialogOpen(true);
                }}
              >
                Add Employee
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 