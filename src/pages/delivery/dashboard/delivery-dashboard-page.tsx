import AppBarBackButton from "@/components/common/app-bar-back-button";
import CreateDeliveryEmployeeDialog from "@/components/feature-specific/delivery/CreateDeliveryEmployeeDialog";
import { deliveryEmployeeColumns } from "@/components/feature-specific/delivery/delivery-employee-columns";
import { deliveryOrdersColumns } from "@/components/feature-specific/delivery/delivery-orders-columns";
import PrintDeliveryEmployeeTableDialog from "@/components/feature-specific/delivery/PrintDeliveryEmployeeTableDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeliveryEmployee } from "@/models/data/delivery.model";
import { APIResponse } from "@/models/responses/api-response.model";
import { WooOrdersResponse } from "@/models/responses/woo_orders.model";
import { getEmployeeCollections } from "@/services/delivery-reports-service";
import {
  getDeliveryCompany,
  getDeliveryEmployees,
} from "@/services/delivery-service";
import { getWooCommerceOrders } from "@/services/woocommerce-service";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircleIcon,
  LoaderIcon,
  RotateCcwIcon,
  SendIcon,
  TruckIcon,
  Undo2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

const ORDER_STATUSES = [
  {
    value: "packing",
    label: "Packing",
    icon: <LoaderIcon className="w-4 h-4 mr-1" />,
  },
  {
    value: "dispaching",
    label: "Dispatching",
    icon: <TruckIcon className="w-4 h-4 mr-1" />,
  },
  {
    value: "deliviring",
    label: "Delivering",
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
    icon: <XIcon className="w-4 h-4 mr-1" />,
  },
];

export default function DeliveryDashboardPage() {
  const params = useParams();
  const companyId = Number(params.id);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [ordersStatus, setOrdersStatus] = useState(ORDER_STATUSES[0].value);
  const [page, setPage] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(undefined);

  const computeDateBounds = (range?: { from?: Date; to?: Date }) => {
    if (!range?.from && !range?.to) return { start: undefined as string | undefined, end: undefined as string | undefined };
    const from = range?.from ? new Date(range.from) : undefined;
    const to = range?.to ? new Date(range.to) : from;
    if (!from) return { start: undefined, end: undefined };
    const startOfDay = new Date(from);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(to!);
    endOfDay.setHours(23, 59, 59, 999);
    const start = startOfDay.toISOString();
    const end = endOfDay.toISOString();
    return { start, end };
  };

  // Company info
  const {
    data: companyData,
    isLoading: companyLoading,
    isError: companyError,
  } = useQuery({
    queryKey: ["delivery-company", companyId],
    queryFn: () => getDeliveryCompany(companyId),
    enabled: !!companyId,
  });
  // Employees
  const {
    data: employeesData,
    isLoading: employeesLoading,
    isError: employeesError,
  } = useQuery({
    queryKey: ["delivery-employees", companyId],
    queryFn: () => getDeliveryEmployees(companyId),
    enabled: !!companyId,
  });
  // Orders (per status)
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery<APIResponse<WooOrdersResponse>>({
    queryKey: [
      "delivery-orders",
      companyId,
      ordersStatus,
      page,
      phoneNumber,
      selectedEmployeeId,
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
    ],
    queryFn: () =>
      getWooCommerceOrders({
        _page: page,
        status: ordersStatus,
        employee_id:
          selectedEmployeeId === "all" ? undefined : Number(selectedEmployeeId),
        phone_number: phoneNumber || undefined,
        delivery_company_id: companyId,
        shipping_provider: "my_companies",
        ...computeDateBounds(dateRange),
      }),
    enabled: !!companyId,
  });

  const company = companyData?.data ?? null;
  const employees: DeliveryEmployee[] = employeesData?.data || [];
  const selectedEmployeeNumeric = selectedEmployeeId === "all" ? undefined : Number(selectedEmployeeId);

  // Employee collections report
  const { data: collections } = useQuery({
    queryKey: [
      "employee-collections",
      companyId,
      selectedEmployeeNumeric,
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
    ],
    queryFn: () => {
      if (!selectedEmployeeNumeric) return Promise.resolve(null);
      const { start, end } = computeDateBounds(dateRange);
      return getEmployeeCollections({ start: start?.slice(0, 10), end: end?.slice(0, 10), employee_id: selectedEmployeeNumeric });
    },
    enabled: !!companyId && !!selectedEmployeeNumeric,
  });

  return (
    <div className="p-4">
      {/* App Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 items-center">
          <AppBarBackButton destination="Delivery" />
          <span className="text-2xl font-bold">
            {company ? company.name : "Delivery Company"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setPrintDialogOpen(true)}>
            Print Employee Table
          </Button>
          <Button onClick={() => setEmployeeDialogOpen(true)}>
            Add Employee
          </Button>
        </div>
      </div>
      <PrintDeliveryEmployeeTableDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        employees={employees}
      />
      <CreateDeliveryEmployeeDialog
        open={employeeDialogOpen}
        onOpenChange={setEmployeeDialogOpen}
        company={company}
      />
      {/* Tabs */}
      <Tabs defaultValue="orders" className="w-full mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
          {/* Delivery Employee filter */}
          <div className="flex gap-2 items-center mb-4">
            <span>Filter by Delivery Employee:</span>
            <div className="w-[220px]">
              <Select
                value={selectedEmployeeId}
                onValueChange={(v) => {
                  setSelectedEmployeeId(v);
                  setPage(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.ID} value={String(emp.ID)}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-4 w-[320px]">
              <DatePickerWithRange
                date={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined}
                onSelect={(range) => setDateRange(range as any)}
              />
            </div>
          </div>
          {selectedEmployeeNumeric && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader>
                  <CardTitle>Delivered Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{ordersData ? (ordersData.data?.orders || []).filter((o) => o.order_status === "delivered").length : "-"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Collected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{collections ? new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format((collections as any).sum_total_collected || 0) : "-"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Amount to be Submitted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{collections ? new Intl.NumberFormat("en-DZ", { style: "currency", currency: "DZD" }).format((collections as any).sum_net || 0) : "-"}</div>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Phone number filter */}
          <div className="flex gap-2 items-center mb-4">
            <span>Filter by Phone Number:</span>
            <Input
              type="text"
              className="border rounded px-2 py-1 w-[200px]"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPhoneNumber(e.target.value)
              }
            />
          </div>
          {/* Nested status tabs */}
          <Tabs
            value={ordersStatus}
            onValueChange={(v) => {
              setOrdersStatus(v);
              setPage(0);
            }}
            className="w-full"
          >
            <TabsList className="mb-4 flex flex-wrap gap-2">
              {ORDER_STATUSES.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="capitalize flex items-center gap-1"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {ORDER_STATUSES.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {ordersLoading && <div>Loading orders...</div>}
                {ordersError && <div>Error loading orders.</div>}
                {!ordersLoading && !ordersError && (
                  <DataTable
                    columns={deliveryOrdersColumns({
                      ordersQueryKey: [
                        "delivery-orders",
                        companyId,
                        ordersStatus,
                        page,
                        phoneNumber,
                        selectedEmployeeId,
                      ],
                    })}
                    data={ordersData?.data?.orders || []}
                    searchColumn="customer_phone"
                    searchBar={false}
                    currentPage={page}
                    onPageChange={setPage}
                    paginationMeta={ordersData?.data?.meta}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
        <TabsContent value="employees">
          {companyLoading && <div>Loading company...</div>}
          {companyError && <div>Error loading company.</div>}
          {employeesLoading && <div>Loading employees...</div>}
          {employeesError && <div>Error loading employees.</div>}
          {!employeesLoading && !employeesError && (
            <DataTable
              columns={deliveryEmployeeColumns}
              data={employees}
              searchColumn="name"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
