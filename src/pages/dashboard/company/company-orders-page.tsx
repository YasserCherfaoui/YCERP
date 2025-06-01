import { RootState } from "@/app/store";
import AppBarBackButton from "@/components/common/app-bar-back-button";
import BulkOperationsDialog from "@/components/feature-specific/orders/bulk-operations-dialog";
import { companyOrdersColumns } from "@/components/feature-specific/orders/company-orders-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrdersWithRealtime } from "@/hooks/use-orders-with-realtime";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/models/data/user.model";
import { getCompanyInventory } from "@/services/inventory-service";
import { assignOrders, shuffleOrders } from "@/services/order-service";
import { getUsersByCompany } from "@/services/user-service";
import { dispatchWooCommerceOrders, exportWooCommerceOrders, refreshWooCommerceStatus } from "@/services/woocommerce-service";
import { cities } from "@/utils/algeria-cities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircleIcon,
  LoaderIcon,
  PackageIcon,
  RefreshCcwIcon,
  RotateCcwIcon,
  SendIcon,
  ShuffleIcon,
  TruckIcon,
  Undo2Icon,
  UserIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import AssignOrdersDialog from "./AssignOrdersDialog";
import ShuffleOrdersDialog from "./ShuffleOrdersDialog";

export default function CompanyOrdersPage() {
  let company = useSelector((state: RootState) => state.company.company);
  const { pathname } = useLocation();
  const isModerator = pathname.includes("moderator");
  if (isModerator) {
    company = useSelector((state: RootState) => state.user.company);
  }
  // Mock data for demonstration

  if (!company) {
    return <div>No company selected</div>;
  }

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("unconfirmed");
  const [selectedUser, setSelectedUser] = useState<number | undefined>(
    undefined
  );
  const [selectedWilaya, setSelectedWilaya] = useState<string | undefined>(
    undefined
  );
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [debouncedPhoneNumber, setDebouncedPhoneNumber] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPhoneNumber(phoneNumber);
    }, 1000);
    return () => {
      clearTimeout(handler);
    };
  }, [phoneNumber]);

  const { orders, meta } = useOrdersWithRealtime(
    currentPage,
    selectedStatus,
    selectedUser,
    selectedWilaya,
    debouncedPhoneNumber
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedStatus, selectedUser, selectedWilaya]);

  useQuery({
    queryKey: ["inventory", company.ID],
    queryFn: () => getCompanyInventory(company.ID),
    enabled: Boolean(company && company.ID),
  }); // --- Shuffle Dialog State ---
  const [shuffleOpen, setShuffleOpen] = useState(false);
  const { data: usersData } = useQuery({
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
  const handleAssignSubmit = (data: {
    orders_ids: number[];
    user_id: number;
  }) => {
    assignOrdersMutation(data);
  };

  // --- Bulk Operations Dialog State ---
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  const { mutate: dispatchWooCommerceOrdersMutation, isPending: dispatchWooCommerceOrdersLoading } = useMutation({
    mutationFn: dispatchWooCommerceOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Orders dispatched successfully",
        description: "Orders have been dispatched successfully",
      });
      setBulkDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to dispatch orders",
        description: "Failed to dispatch orders",
        variant: "destructive",
      });
    },
  });
  const { mutate: exportWooCommerceOrdersMutation, isPending: exportWooCommerceOrdersLoading } = useMutation({
    mutationFn: exportWooCommerceOrders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Orders exported successfully",
        description: "Orders have been exported successfully",
      });
      setBulkDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Failed to export orders",
        description: "Failed to export orders",
        variant: "destructive",
      });
    },
  });


  const { mutate: refreshWooCommerceStatusMutation } = useMutation({
    mutationFn: refreshWooCommerceStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "WooCommerce status refreshed successfully",
        description: "WooCommerce status has been refreshed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to refresh WooCommerce status",
        description: "Failed to refresh WooCommerce status",
        variant: "destructive",
      });
    },
  });

  const handleExportSubmit = (orderIDs: number[]) => {
    exportWooCommerceOrdersMutation(orderIDs);
    setSelectedRows([]);
  }
  const handleDispatchSubmit = (orderIDs: number[]) => {
    dispatchWooCommerceOrdersMutation(orderIDs);
    setSelectedRows([]);
  };


  // Statuses and icons
  const statusTabs = [
    {
      value: "unconfirmed",
      label: "Unconfirmed",
      icon: <PackageIcon className="w-4 h-4 mr-1" />,
    },
    {
      value: "packing",
      label: "Packing",
      icon: <LoaderIcon className="w-4 h-4 mr-1" />,
    },
    {
      value: "dispaching",
      label: "Dispaching",
      icon: <TruckIcon className="w-4 h-4 mr-1" />,
    },
    {
      value: "deliviring",
      label: "Deliviring",
      icon: <SendIcon className="w-4 h-4 mr-1" />,
    },
    {
      value: "delivered",
      label: "Delivered",
      icon: <CheckCircleIcon className="w-4 h-4 mr-1" />,
    },
    {
      value: "returning",
      label: "Returning",
      icon: <RotateCcwIcon className="w-4 h-4 mr-1" />,
    },
    {
      value: "returned",
      label: "Returned",
      icon: <Undo2Icon className="w-4 h-4 mr-1" />,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      icon: <XCircleIcon className="w-4 h-4 mr-1" />,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          <AppBarBackButton destination="Menu" />
          <h1 className="text-2xl font-bold">WooCommerce Orders</h1>
        </div>
        <div className="flex gap-2">
          <Button disabled={isModerator} onClick={() => setShuffleOpen(true)}>
            <ShuffleIcon className="w-4 h-4" />
            Shuffle Orders
          </Button>
          <Button onClick={() => refreshWooCommerceStatusMutation()}>
            <RefreshCcwIcon className="w-4 h-4" />
            Refresh Status
          </Button>
          <Button
            onClick={() => setAssignOpen(true)}
            disabled={isModerator || selectedRows.length === 0}
          >
            <UserIcon className="w-4 h-4" />
            Assign Orders
          </Button>
          <Button
            onClick={() => setBulkDialogOpen(true)}
            disabled={selectedRows.length === 0}
          >
            Bulk Operations
          </Button>
        </div>
      </div>
      <div>
        <div className="flex gap-2 items-center mb-4 pt-6">
          <span>Filter by User:</span>
          <Select
            value={selectedUser !== undefined ? String(selectedUser) : "all"}
            onValueChange={(e) =>
              setSelectedUser(e === "all" ? undefined : Number(e))
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((user: User) => (
                <SelectItem key={user.ID} value={String(user.ID)}>
                  {user.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>Filter by Wilaya:</span>
          <Select
            value={selectedWilaya || "all"}
            onValueChange={(e) =>
              setSelectedWilaya(e === "all" ? undefined : e)
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Wilayas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wilayas</SelectItem>
              {cities.sort((a, b) => a.label.localeCompare(b.label)).map((city) => (
                <SelectItem key={city.key} value={city.key}>
                  {city.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div id="#secondary-filters">
          <div className="flex gap-2 items-center mb-4">
            <span>Filter by Phone Number:</span>
            <Input
              type="text"
              className="border rounded px-2 py-1 w-[200px]"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabs for order statuses */}
      <Tabs
        value={selectedStatus}
        onValueChange={setSelectedStatus}
        className="w-full mt-6"
      >
        <TabsList className="mb-4 flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1"
            >
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {statusTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <DataTable
              columns={companyOrdersColumns}
              data={orders}
              searchColumn="phone"
              getRowId={(row) => String(row.id)}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              paginationMeta={meta}
              onPageChange={setCurrentPage}
              currentPage={currentPage}
              searchBar={false}
            />
          </TabsContent>
        ))}
      </Tabs>
      {/* Shuffle and Assign dialogs */}
      {!isModerator && (
        <>
          <ShuffleOrdersDialog
            open={shuffleOpen}
            onClose={() => setShuffleOpen(false)}
            users={users}
            orders={orders || []}
            onSubmit={handleShuffleSubmit}
          />
          <AssignOrdersDialog
            open={assignOpen}
            onClose={() => setAssignOpen(false)}
            users={users}
            orderIds={selectedRows.map(Number)}
            onSubmit={handleAssignSubmit}
          />
        
        </>
      )}
        <BulkOperationsDialog
            open={bulkDialogOpen}
            setOpen={setBulkDialogOpen}
            selectedCount={selectedRows.length}
            onDispatch={() => handleDispatchSubmit(selectedRows.map(Number))}
            onExport={() => handleExportSubmit(selectedRows.map(Number))}
            dispatchLoading={dispatchWooCommerceOrdersLoading}
            exportLoading={exportWooCommerceOrdersLoading}
          />

    </div>
  );
}
