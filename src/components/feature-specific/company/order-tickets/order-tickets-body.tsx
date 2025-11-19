import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DataTable } from "@/components/ui/data-table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Qualification } from "@/models/data/qualification.model";
import { OrderTicketResponse } from "@/models/responses/issue-response.model";
import { createIssueReply, getOrderTickets } from "@/services/issue-service";
import { getQualifications } from "@/services/qualification-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { FiMessageCircle, FiPlus, FiTag, FiTrash2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import CreateOrderFromScratchDialog from "../../orders/create-order-from-scratch-dialog";
import IssuesReplyDialog from "../issues/issues-reply-dialog";
import { AddClientStatusDialog } from "./add-client-status-dialog";
import ClientStatusDetailsDialog from "./client-status-details-dialog";

export default function OrderTicketsBody() {
  // Support both company users and moderators
  const companyFromCompanyState = useSelector((state: RootState) => state.company.company);
  const companyFromUserState = useSelector((state: RootState) => state.user.company);
  const company = companyFromCompanyState || companyFromUserState;
  
  // Filter state
  const [selectedQualificationId, setSelectedQualificationId] = useState<number | undefined>(undefined);
  const [qualificationDateRange, setQualificationDateRange] = useState<DateRange | undefined>(undefined);
  const [ticketCreatedDateRange, setTicketCreatedDateRange] = useState<DateRange | undefined>(undefined);
  const [wooOrderCreatedDateRange, setWooOrderCreatedDateRange] = useState<DateRange | undefined>(undefined);
  
  // Fetch qualifications for filter dropdown
  const { data: qualificationsData } = useQuery({
    queryKey: ["qualifications"],
    queryFn: getQualifications,
  });
  
  const qualifications = qualificationsData?.data?.filter(
    (q: Qualification) => q.parent_id === null && !q.is_order_history
  ) || [];
  
  // Format date range for API
  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return { dateFrom: undefined, dateTo: undefined };
    const dateFrom = range.from ? format(range.from, "yyyy-MM-dd") : undefined;
    const dateTo = range.to ? format(range.to, "yyyy-MM-dd") : undefined;
    return { dateFrom, dateTo };
  };
  
  const { dateFrom, dateTo } = formatDateRange(qualificationDateRange);
  const { dateFrom: ticketCreatedFrom, dateTo: ticketCreatedTo } = formatDateRange(ticketCreatedDateRange);
  const { dateFrom: wooOrderCreatedFrom, dateTo: wooOrderCreatedTo } = formatDateRange(wooOrderCreatedDateRange);
  
  const { data } = useQuery({
    queryKey: ["order-tickets", company?.ID, selectedQualificationId, dateFrom, dateTo, ticketCreatedFrom, ticketCreatedTo, wooOrderCreatedFrom, wooOrderCreatedTo],
    queryFn: () => getOrderTickets(company?.ID, selectedQualificationId, dateFrom, dateTo, ticketCreatedFrom, ticketCreatedTo, wooOrderCreatedFrom, wooOrderCreatedTo),
    enabled: !!company,
  });
  const [tab, setTab] = useState("unsolved");
  const [replyTicket, setReplyTicket] = useState<OrderTicketResponse | null>(null);
  const [clientStatusTicket, setClientStatusTicket] = useState<OrderTicketResponse | null>(null);
  const [createOrderTicket, setCreateOrderTicket] = useState<OrderTicketResponse | null>(null);
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Split tickets by solved/unsolved
  const tickets = data?.data || [];
  const unsolved = tickets.filter((ticket) => !ticket.support_replies || ticket.support_replies.length === 0);
  const solved = tickets.filter((ticket) => ticket.support_replies && ticket.support_replies.length > 0);

  // Table columns
  const columns: ColumnDef<OrderTicketResponse>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "full_name", header: "Full Name" },
    { accessorKey: "phone", header: "Phone", id: "phone_number" },
    { accessorKey: "comment", header: "Comment" },
    {
      accessorKey: "order_ticket_uploads",
      header: "Uploads",
      cell: ({ row }) => {
        const uploads = row.original.order_ticket_uploads;
        if (!uploads || uploads.length === 0) return <span>-</span>;
        return (
          <div className="flex flex-wrap gap-2">
            {uploads.map((upload) => (
              <a
                key={upload.id}
                href={upload.signed_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                File #{upload.id}
              </a>
            ))}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "client_statuses",
      header: "Client Status",
      cell: ({ row }) => {
        const [open, setOpen] = useState(false);
        const [setStatusOpen, setSetStatusOpen] = useState(false);
        const statuses = row.original.client_statuses || [];
        const sortedStatuses = [...statuses].sort(
          (a, b) =>
            new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
        );
        const lastStatus = sortedStatuses[0];
        return (
          <>
            <div
              className={cn(
                "cursor-pointer",
                statuses.length === 0
                  ? "bg-gray-500 p-2 rounded-md text-white text-center"
                  : "p-2 rounded-md text-black text-center flex flex-col gap-2"
              )}
              style={
                statuses.length > 0
                  ? {
                      backgroundColor: lastStatus?.sub_qualification
                        ? lastStatus?.sub_qualification?.color
                        : lastStatus?.qualification?.color?.startsWith("#")
                        ? lastStatus?.qualification?.color
                        : "gray",
                    }
                  : {}
              }
              onClick={() => setOpen(true)}
            >
              {statuses.length === 0 ? (
                "No status"
              ) : (
                <>
                  <span className="font-bold">
                    {lastStatus?.qualification?.name}
                  </span>
                  <span>{lastStatus?.sub_qualification?.name}</span>
                </>
              )}
            </div>
            <ClientStatusDetailsDialog
              open={open}
              onClose={() => setOpen(false)}
              statuses={statuses}
              onSetStatus={() => {
                setOpen(false);
                setSetStatusOpen(true);
              }}
              setStatusOpen={setStatusOpen}
              setSetStatusOpen={setSetStatusOpen}
              orderTicketID={row.original.id}
              queryKey={["order-tickets", company?.ID, selectedQualificationId, dateFrom, dateTo, ticketCreatedFrom, ticketCreatedTo, wooOrderCreatedFrom, wooOrderCreatedTo]}
            />
          </>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "woo_order",
      header: "Order Status",
      cell: ({ row }) => {
        const wooOrder = row.original.woo_order;
        if (!wooOrder) {
          return <span className="text-muted-foreground">-</span>;
        }
        const statusColors: Record<string, string> = {
          unconfirmed: "bg-gray-500",
          packing: "bg-blue-500",
          dispaching: "bg-yellow-500",
          deliviring: "bg-orange-500",
          delivered: "bg-green-500",
          returning: "bg-purple-500",
          returned: "bg-red-500",
          cancelled: "bg-gray-700",
          relaunched: "bg-indigo-500",
        };
        const statusColor = statusColors[wooOrder.order_status] || "bg-gray-500";
        return (
          <div className="flex items-center gap-2">
            <span className={cn("px-2 py-1 rounded text-white text-xs font-medium", statusColor)}>
              {wooOrder.order_status || "N/A"}
            </span>
            {wooOrder.id && (
              <span className="text-xs text-muted-foreground">#{wooOrder.id}</span>
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {!row.original.woo_order_id && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => {
                setCreateOrderTicket(row.original);
                setCreateOrderDialogOpen(true);
              }} 
              title="Create Order"
            >
              <FiPlus className="w-5 h-5" />
            </Button>
          )}
          {tab === "unsolved" && (
            <Button size="icon" variant="ghost" onClick={() => setReplyTicket(row.original)} title="Reply">
              <FiMessageCircle className="w-5 h-5" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={() => setClientStatusTicket(row.original)} title="Add Client Status">
            <FiTag className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => {/* TODO: handle delete */}} title="Delete">
            <FiTrash2 className="w-5 h-5 text-red-500" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  // Reply dialog logic
  const { mutate: createReply } = useMutation({
    mutationFn: createIssueReply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-tickets"] });
      setReplyTicket(null);
    },
  });

  // Clear filters handler
  const clearFilters = () => {
    setSelectedQualificationId(undefined);
    setQualificationDateRange(undefined);
    setTicketCreatedDateRange(undefined);
    setWooOrderCreatedDateRange(undefined);
  };

  return (
    <div className="w-full">
      {/* Filter Controls */}
      <div className="flex items-center gap-4 mb-4 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Qualification:</span>
          <Select
            value={selectedQualificationId?.toString() || "all"}
            onValueChange={(value) => {
              if (value === "all") {
                setSelectedQualificationId(undefined);
              } else {
                setSelectedQualificationId(Number(value));
              }
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Qualifications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Qualifications</SelectItem>
              {qualifications.map((qualification: Qualification) => (
                <SelectItem key={qualification.ID} value={qualification.ID.toString()}>
                  {qualification.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Qualification Date:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !qualificationDateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {qualificationDateRange?.from ? (
                  qualificationDateRange.to ? (
                    <>
                      {format(qualificationDateRange.from, "LLL dd, y")} -{" "}
                      {format(qualificationDateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(qualificationDateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={qualificationDateRange?.from}
                selected={qualificationDateRange}
                onSelect={setQualificationDateRange}
                numberOfMonths={2}
              />
              <div className="flex justify-end p-2 border-t">
                <Button size="sm" variant="ghost" onClick={() => setQualificationDateRange(undefined)}>
                  Reset
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Ticket Creation Date:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !ticketCreatedDateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {ticketCreatedDateRange?.from ? (
                  ticketCreatedDateRange.to ? (
                    <>
                      {format(ticketCreatedDateRange.from, "LLL dd, y")} -{" "}
                      {format(ticketCreatedDateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(ticketCreatedDateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={ticketCreatedDateRange?.from}
                selected={ticketCreatedDateRange}
                onSelect={setTicketCreatedDateRange}
                numberOfMonths={2}
              />
              <div className="flex justify-end p-2 border-t">
                <Button size="sm" variant="ghost" onClick={() => setTicketCreatedDateRange(undefined)}>
                  Reset
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">WooOrder Creation Date:</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !wooOrderCreatedDateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {wooOrderCreatedDateRange?.from ? (
                  wooOrderCreatedDateRange.to ? (
                    <>
                      {format(wooOrderCreatedDateRange.from, "LLL dd, y")} -{" "}
                      {format(wooOrderCreatedDateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(wooOrderCreatedDateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={wooOrderCreatedDateRange?.from}
                selected={wooOrderCreatedDateRange}
                onSelect={setWooOrderCreatedDateRange}
                numberOfMonths={2}
              />
              <div className="flex justify-end p-2 border-t">
                <Button size="sm" variant="ghost" onClick={() => setWooOrderCreatedDateRange(undefined)}>
                  Reset
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {(selectedQualificationId !== undefined || qualificationDateRange || ticketCreatedDateRange || wooOrderCreatedDateRange) && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
      
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="unsolved">Unsolved Tickets</TabsTrigger>
          <TabsTrigger value="solved">Solved Tickets</TabsTrigger>
        </TabsList>
      <TabsContent value="unsolved">
        <DataTable
          columns={columns}
          data={unsolved}
          searchColumn="phone_number"
        />
        <IssuesReplyDialog
          open={!!replyTicket}
          onClose={() => setReplyTicket(null)}
          orderTicket={replyTicket}
          onSubmit={(data) => createReply({ order_ticket_id: replyTicket?.id ?? null, issue_ticket_id: null, reply: data.reply })}
        />
        <AddClientStatusDialog
          open={!!clientStatusTicket}
          setOpen={(open) => !open && setClientStatusTicket(null)}
          orderTicketID={clientStatusTicket?.id ?? 0}
          queryKey={["order-tickets", company?.ID, selectedQualificationId, dateFrom, dateTo, ticketCreatedFrom, ticketCreatedTo, wooOrderCreatedFrom, wooOrderCreatedTo]}
        />
        <CreateOrderFromScratchDialog
          open={createOrderDialogOpen}
          setOpen={(open) => {
            setCreateOrderDialogOpen(open);
            if (!open) {
              setCreateOrderTicket(null);
            }
          }}
          ordersQueryKey={["order-tickets", company?.ID, selectedQualificationId, dateFrom, dateTo, ticketCreatedFrom, ticketCreatedTo, wooOrderCreatedFrom, wooOrderCreatedTo]}
          initialCustomerName={createOrderTicket?.full_name}
          initialCustomerPhone={createOrderTicket?.phone}
          orderTicketId={createOrderTicket?.id}
        />
      </TabsContent>
      <TabsContent value="solved">
        <DataTable
          columns={columns}
          data={solved}
          searchColumn="phone_number"
        />
        <AddClientStatusDialog
          open={!!clientStatusTicket}
          setOpen={(open) => !open && setClientStatusTicket(null)}
          orderTicketID={clientStatusTicket?.id ?? 0}
          queryKey={["order-tickets", company?.ID, selectedQualificationId, dateFrom, dateTo, ticketCreatedFrom, ticketCreatedTo, wooOrderCreatedFrom, wooOrderCreatedTo]}
        />
        <CreateOrderFromScratchDialog
          open={createOrderDialogOpen}
          setOpen={(open) => {
            setCreateOrderDialogOpen(open);
            if (!open) {
              setCreateOrderTicket(null);
            }
          }}
          ordersQueryKey={["order-tickets", company?.ID, selectedQualificationId, dateFrom, dateTo, ticketCreatedFrom, ticketCreatedTo, wooOrderCreatedFrom, wooOrderCreatedTo]}
          initialCustomerName={createOrderTicket?.full_name}
          initialCustomerPhone={createOrderTicket?.phone}
          orderTicketId={createOrderTicket?.id}
        />
      </TabsContent>
    </Tabs>
    </div>
  );
} 