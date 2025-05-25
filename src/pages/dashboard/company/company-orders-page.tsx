import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import { companyOrdersColumns } from "@/components/feature-specific/orders/company-orders-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getCompanyInventory } from "@/services/inventory-service";
import { assignOrders, shuffleOrders } from "@/services/order-service";
import { getUsersByCompany } from "@/services/user-service";
import { getWooCommerceOrders } from "@/services/woocommerce-service";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useQuery as useUsersQuery,
} from "@tanstack/react-query";
import { CheckCircleIcon, LoaderIcon, PackageIcon, RotateCcwIcon, SendIcon, ShuffleIcon, TruckIcon, Undo2Icon, UserIcon, XCircleIcon } from "lucide-react";
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
  useQuery({
    queryKey: ["inventory", company.ID],
    queryFn: () => getCompanyInventory(company.ID),
    enabled: Boolean(company && company.ID),
  });  // --- Shuffle Dialog State ---
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

  const [selectedStatus, setSelectedStatus] = useState("unconfirmed");

  // Statuses and icons
  const statusTabs = [
    { value: "unconfirmed", label: "Unconfirmed", icon: <PackageIcon className="w-4 h-4 mr-1" /> },
    { value: "packing", label: "Packing", icon: <LoaderIcon className="w-4 h-4 mr-1" /> },
    { value: "dispaching", label: "Dispaching", icon: <TruckIcon className="w-4 h-4 mr-1" /> },
    { value: "deliviring", label: "Deliviring", icon: <SendIcon className="w-4 h-4 mr-1" /> },
    { value: "delivered", label: "Delivered", icon: <CheckCircleIcon className="w-4 h-4 mr-1" /> },
    { value: "returning", label: "Returning", icon: <RotateCcwIcon className="w-4 h-4 mr-1" /> },
    { value: "returned", label: "Returned", icon: <Undo2Icon className="w-4 h-4 mr-1" /> },
    { value: "cancelled", label: "Cancelled", icon: <XCircleIcon className="w-4 h-4 mr-1" /> },
  ];

  // Filter orders by selected status
  const filteredOrders = (orders?.data || []).filter((order) => order.order_status == selectedStatus);

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
      {/* Tabs for order statuses */}
      <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-full mt-6">
        <TabsList className="mb-4 flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {statusTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <DataTable
              columns={companyOrdersColumns}
              data={filteredOrders}
              searchColumn="phone"
              getRowId={(row) => String(row.id)}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
            />
          </TabsContent>
        ))}
      </Tabs>
      {/* Shuffle and Assign dialogs */}
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
