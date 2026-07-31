import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeliveryEmployee, DeliveryEmployeePayment } from "@/models/data/delivery.model";
import { listDeliveryEmployeePayments } from "@/services/delivery-payments-service";
import { getDeliveryEmployees } from "@/services/delivery-service";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

function formatDzd(amount: number) {
  return new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format(amount);
}

export default function DeliveryEmployeeProfilePage() {
  const params = useParams();
  const navigate = useNavigate();
  const deliveryCompanyId = Number(params.id);
  const employeeId = Number(params.employeeId);

  const { data: employeesData, isLoading: employeesLoading, isError: employeesError } = useQuery({
    queryKey: ["delivery-employees", deliveryCompanyId],
    queryFn: () => getDeliveryEmployees(deliveryCompanyId),
    enabled: !!deliveryCompanyId,
  });

  const employee: DeliveryEmployee | undefined = useMemo(
    () => (employeesData?.data || []).find((e) => e.ID === employeeId),
    [employeesData, employeeId]
  );

  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useQuery({
    queryKey: ["delivery-employee-payments", employeeId],
    queryFn: () => listDeliveryEmployeePayments({ employee_id: employeeId }),
    enabled: !!employeeId,
  });

  const payments: DeliveryEmployeePayment[] = paymentsData?.data || [];
  const totalRemitted = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="p-4 space-y-6">
      <div className="flex gap-4 items-center">
        <Button onClick={() => navigate(`../..`)}>
          <ArrowLeft />
          Back to Delivery
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {employee?.name ?? (employeesLoading ? "Loading..." : "Delivery employee")}
          </h1>
          {employee?.email && (
            <p className="text-sm text-muted-foreground">{employee.email}</p>
          )}
        </div>
      </div>

      {employeesError && <div>Error loading employee.</div>}
      {!employeesLoading && !employee && !employeesError && (
        <div>Employee not found for this delivery company.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total remitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatDzd(totalRemitted)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {payments.length} payment{payments.length === 1 ? "" : "s"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment ledger</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading && <div>Loading payments...</div>}
          {paymentsError && <div>Error loading payments.</div>}
          {!paymentsLoading && !paymentsError && payments.length === 0 && (
            <div className="text-sm text-muted-foreground">No payments recorded yet.</div>
          )}
          {!paymentsLoading && !paymentsError && payments.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collected at</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Recorded at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.ID}>
                    <TableCell>
                      {p.collected_at
                        ? new Date(p.collected_at).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>{formatDzd(p.amount)}</TableCell>
                    <TableCell>{p.notes || "-"}</TableCell>
                    <TableCell>
                      {p.CreatedAt ? new Date(p.CreatedAt).toLocaleString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
