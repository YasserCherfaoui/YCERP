import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { companyOrdersColumns } from "@/components/feature-specific/orders/company-orders-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { assignOrders, shuffleOrders } from "@/services/order-service";
import { getUsersByCompany } from "@/services/user-service";
import { getWooCommerceOrders } from "@/services/woocommerce-service";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useQuery as useUsersQuery,
} from "@tanstack/react-query";
import { ShuffleIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import AssignOrdersDialog from "./AssignOrdersDialog";
import ShuffleOrdersDialog from "./ShuffleOrdersDialog";

export default function CompanyOrdersPage() {
  // Mock data for demonstration
  const company = useSelector((state: RootState) => state.company.company);
  if (!company) {
    return <div>No company selected</div>;
  }
  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getWooCommerceOrders(),
  });

  // --- Shuffle Dialog State ---
  const [shuffleOpen, setShuffleOpen] = useState(false);
  const { data: usersData } = useUsersQuery({
    queryKey: ["users", company.ID],
    queryFn: () => getUsersByCompany(company.ID),
  });
  const users = usersData?.data || [];

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: shuffleOrdersMutation } = useMutation({
    mutationFn: shuffleOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Orders shuffled successfully",
        description: "Orders have been shuffled successfully",
      });
      setShuffleOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to shuffle orders",
        description: "Failed to shuffle orders",
        variant: "destructive",
      });
    },
  });
  const handleShuffleSubmit = (data: { selected_users: number[] }) => {
    // TODO: Send shuffle request to backend
    console.log("Shuffle request:", data);
    shuffleOrdersMutation(data);
  };
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // --- Assign Dialog State ---
  const [assignOpen, setAssignOpen] = useState(false);
  // Placeholder mutation for assigning orders (implement in order-service.ts)
  const { mutate: assignOrdersMutation } = useMutation({
    mutationFn: assignOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Orders assigned successfully",
        description: "Orders have been assigned successfully",
      });
      setAssignOpen(false);
      setSelectedRows([]);
    },
    onError: () => {
      toast({
        title: "Failed to assign orders",
        description: "Failed to assign orders",
        variant: "destructive",
      });
    },
  });
  const handleAssignSubmit = (data: { orders_ids: number[]; user_id: number }) => {
    assignOrdersMutation(data);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          <AppBarBackButton destination="Menu" />
          <h1 className="text-2xl font-bold">WooCommerce Orders</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShuffleOpen(true)}>
            <ShuffleIcon className="w-4 h-4" />
            Shuffle Orders
          </Button>
          <Button onClick={() => setAssignOpen(true)} disabled={selectedRows.length === 0}>
            <UserIcon className="w-4 h-4" />
            Assign Orders
          </Button>
        </div>
      </div>
      <DataTable
        columns={companyOrdersColumns}
        data={orders?.data || []}
        searchColumn="phone"
        getRowId={(row) => String(row.id)}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
      />
      <ShuffleOrdersDialog
        open={shuffleOpen}
        onClose={() => setShuffleOpen(false)}
        users={users}
        orders={orders?.data || []}
        onSubmit={handleShuffleSubmit}
      />
      <AssignOrdersDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        users={users}
        orderIds={selectedRows.map(Number)}
        onSubmit={handleAssignSubmit}
      />
    </div>
  );
}
