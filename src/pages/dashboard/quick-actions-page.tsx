import { RootState } from "@/app/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/models/data/order.model";
import { getDeliveryEmployees } from "@/services/delivery-service";
import {
    getCustomerPhoneSearch,
    getEmployeeOrders,
    getInventoryTransactionLogs, getOrdersByStatusSize,
    getProductSalesByProvider,
    getQRCodeSalesSummary,
    getSalesByType,
    QueryResponse
} from "@/services/queries-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, CalendarIcon, Loader2, Search, Zap } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

// Form schemas
const qrCodeSalesSchema = z.object({
  start_date: z.date(),
  end_date: z.date(),
});

const ordersByStatusSizeSchema = z.object({
  order_status: z.string(),
  sizes: z.string().transform(str => str.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))),
  start_date: z.date(),
  end_date: z.date(),
});

const employeeOrdersSchema = z.object({
  employee_id: z.string(),
  start_date: z.date(),
  end_date: z.date(),
  order_status: z.string().optional(),
});

const productSalesByProviderSchema = z.object({
  start_date: z.date(),
  end_date: z.date(),
  order_status: z.string(),
  shipping_provider: z.string(),
});

const salesByTypeSchema = z.object({
  start_date: z.date(),
  end_date: z.date(),
  sale_type: z.string(),
});

const customerPhoneSearchSchema = z.object({
  phone_pattern: z.string().min(1, "Phone pattern is required"),
});

const inventoryTransactionLogsSchema = z.object({
  location_type: z.string(),
  start_date: z.date(),
  end_date: z.date(),
});

// Order statuses from the OrderStatus enum
const orderStatuses = Object.values(OrderStatus);

// Sale types (common ones)
const saleTypes = ["warehouse", "algiers", "franchise"];

// Shipping providers (common ones)
const shippingProviders = ["my_companies", "yalidine"];

// Location types for inventory
const locationTypes = ["warehouse", "store", "franchise"];

export default function QuickActionsPage() {
  const navigate = useNavigate();
  const company = useSelector((state: RootState) => state.company.company);
  const [activeTab, setActiveTab] = useState("qr-sales");
  const [queryResults, setQueryResults] = useState<QueryResponse<any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch delivery employees for the current company (default to company_id 1 if no company in state)
  const companyId = company?.ID || 1;
  const { data: employeesData } = useQuery({
    queryKey: ["delivery-employees", companyId],
    queryFn: () => getDeliveryEmployees(companyId),
    enabled: true, // Always enabled since we have a fallback company_id
  });

  const employees = employeesData?.data || [];

  // Form instances
  const qrCodeForm = useForm<z.infer<typeof qrCodeSalesSchema>>({
    resolver: zodResolver(qrCodeSalesSchema),
    defaultValues: {
      start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      end_date: new Date(),
    },
  });

  const ordersByStatusSizeForm = useForm<z.infer<typeof ordersByStatusSizeSchema>>({
    resolver: zodResolver(ordersByStatusSizeSchema),
    defaultValues: {
      order_status: OrderStatus.Delivered,
      sizes: [38, 39, 40, 41],
      start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      end_date: new Date(),
    },
  });

  const employeeOrdersForm = useForm<z.infer<typeof employeeOrdersSchema>>({
    resolver: zodResolver(employeeOrdersSchema),
    defaultValues: {
      employee_id: "",
      start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      end_date: new Date(),
      order_status: OrderStatus.Delivered,
    },
  });

  const productSalesByProviderForm = useForm<z.infer<typeof productSalesByProviderSchema>>({
    resolver: zodResolver(productSalesByProviderSchema),
    defaultValues: {
      start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      end_date: new Date(),
      order_status: OrderStatus.Delivered,
      shipping_provider: "my_companies",
    },
  });

  const salesByTypeForm = useForm<z.infer<typeof salesByTypeSchema>>({
    resolver: zodResolver(salesByTypeSchema),
    defaultValues: {
      start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      end_date: new Date(),
      sale_type: "warehouse",
    },
  });

  const customerPhoneSearchForm = useForm<z.infer<typeof customerPhoneSearchSchema>>({
    resolver: zodResolver(customerPhoneSearchSchema),
    defaultValues: {
      phone_pattern: "",
    },
  });

  const inventoryTransactionLogsForm = useForm<z.infer<typeof inventoryTransactionLogsSchema>>({
    resolver: zodResolver(inventoryTransactionLogsSchema),
    defaultValues: {
      location_type: "warehouse",
      start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      end_date: new Date(),
    },
  });

  const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

  // Query handlers
  const onQRCodeSalesSubmit = async (values: z.infer<typeof qrCodeSalesSchema>) => {
    setIsLoading(true);
    try {
      const result = await getQRCodeSalesSummary({
        start_date: formatDate(values.start_date),
        end_date: formatDate(values.end_date),
        company_id: companyId,
      });
      setQueryResults(result);
    } catch (error) {
      console.error("Error fetching QR code sales:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onOrdersByStatusSizeSubmit = async (values: z.infer<typeof ordersByStatusSizeSchema>) => {
    setIsLoading(true);
    try {
      const result = await getOrdersByStatusSize({
        order_status: values.order_status,
        sizes: values.sizes,
        start_date: formatDate(values.start_date),
        end_date: formatDate(values.end_date),
        company_id: companyId,
      });
      setQueryResults(result);
    } catch (error) {
      console.error("Error fetching orders by status and size:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onEmployeeOrdersSubmit = async (values: z.infer<typeof employeeOrdersSchema>) => {
    setIsLoading(true);
    try {
      const result = await getEmployeeOrders({
        employee_id: parseInt(values.employee_id),
        start_date: formatDate(values.start_date),
        end_date: formatDate(values.end_date),
        order_status: values.order_status,
      });
      setQueryResults(result);
    } catch (error) {
      console.error("Error fetching employee orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onProductSalesByProviderSubmit = async (values: z.infer<typeof productSalesByProviderSchema>) => {
    setIsLoading(true);
    try {
      const result = await getProductSalesByProvider({
        start_date: formatDate(values.start_date),
        end_date: formatDate(values.end_date),
        order_status: values.order_status,
        shipping_provider: values.shipping_provider,
        company_id: companyId,
      });
      setQueryResults(result);
    } catch (error) {
      console.error("Error fetching product sales by provider:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSalesByTypeSubmit = async (values: z.infer<typeof salesByTypeSchema>) => {
    setIsLoading(true);
    try {
      const result = await getSalesByType({
        start_date: formatDate(values.start_date),
        end_date: formatDate(values.end_date),
        sale_type: values.sale_type,
      });
      setQueryResults(result);
    } catch (error) {
      console.error("Error fetching sales by type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onCustomerPhoneSearchSubmit = async (values: z.infer<typeof customerPhoneSearchSchema>) => {
    setIsLoading(true);
    try {
      const result = await getCustomerPhoneSearch({
        phone_pattern: `%${values.phone_pattern}%`,
      });
      setQueryResults(result);
    } catch (error) {
      console.error("Error searching customer phone:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onInventoryTransactionLogsSubmit = async (values: z.infer<typeof inventoryTransactionLogsSchema>) => {
    setIsLoading(true);
    try {
      const result = await getInventoryTransactionLogs({
        location_type: values.location_type,
        start_date: formatDate(values.start_date),
        end_date: formatDate(values.end_date),
      });
      setQueryResults(result);
    } catch (error) {
      console.error("Error fetching inventory transaction logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const DatePickerField = ({ form, name, label }: { form: any; name: string; label: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderResults = () => {
    if (!queryResults) return null;

    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Query Results
          </CardTitle>
          <CardDescription>
            Found {queryResults.pagination.total} results in {queryResults.execution.execution_time_ms}ms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Badge variant="secondary">
              Page {queryResults.pagination.page} of {queryResults.pagination.total_pages}
            </Badge>
            <Badge variant="outline">
              {queryResults.data.length} items
            </Badge>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {queryResults.data.length > 0 && Object.keys(queryResults.data[0]).map((key) => (
                    <TableHead key={key}>{key.replace(/_/g, ' ').toUpperCase()}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryResults.data.map((item, index) => (
                  <TableRow key={index}>
                    {Object.values(item).map((value, i) => (
                      <TableCell key={i}>
                        {typeof value === 'number' ? value.toLocaleString() : String(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="h-8 w-8" />
              Quick Actions
            </h1>
            <p className="text-muted-foreground">
              Execute quick queries to get insights about your business data
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="qr-sales">QR Sales</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="qr-sales" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* QR Code Sales Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>QR Code Sales Summary</CardTitle>
                  <CardDescription>Get sales summary grouped by QR code</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...qrCodeForm}>
                    <form onSubmit={qrCodeForm.handleSubmit(onQRCodeSalesSubmit)} className="space-y-4">
                      <DatePickerField form={qrCodeForm} name="start_date" label="Start Date" />
                      <DatePickerField form={qrCodeForm} name="end_date" label="End Date" />
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Run Query
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Customer Phone Search */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Phone Search</CardTitle>
                  <CardDescription>Search orders by customer phone number</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...customerPhoneSearchForm}>
                    <form onSubmit={customerPhoneSearchForm.handleSubmit(onCustomerPhoneSearchSubmit)} className="space-y-4">
                      <FormField
                        control={customerPhoneSearchForm.control}
                        name="phone_pattern"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Pattern</FormLabel>
                            <FormControl>
                              <Input placeholder="555-1234" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Search
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders by Status and Size */}
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Status & Size</CardTitle>
                  <CardDescription>Filter orders by status and product sizes</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...ordersByStatusSizeForm}>
                    <form onSubmit={ordersByStatusSizeForm.handleSubmit(onOrdersByStatusSizeSubmit)} className="space-y-4">
                      <FormField
                        control={ordersByStatusSizeForm.control}
                        name="order_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {orderStatuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.replace(/([A-Z])/g, ' $1').trim()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={ordersByStatusSizeForm.control}
                        name="sizes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sizes (comma-separated)</FormLabel>
                            <FormControl>
                              <Input placeholder="38,39,40,41" {...field} value={field.value.join(",")} onChange={(e) => field.onChange(e.target.value.split(","))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DatePickerField form={ordersByStatusSizeForm} name="start_date" label="Start Date" />
                      <DatePickerField form={ordersByStatusSizeForm} name="end_date" label="End Date" />
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Run Query
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Employee Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Employee Orders</CardTitle>
                  <CardDescription>Get orders handled by specific employee</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...employeeOrdersForm}>
                    <form onSubmit={employeeOrdersForm.handleSubmit(onEmployeeOrdersSubmit)} className="space-y-4">
                      <FormField
                        control={employeeOrdersForm.control}
                        name="employee_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {employees.map((employee) => (
                                  <SelectItem key={employee.ID} value={employee.ID.toString()}>
                                    {employee.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={employeeOrdersForm.control}
                        name="order_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Status (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {orderStatuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.replace(/([A-Z])/g, ' $1').trim()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DatePickerField form={employeeOrdersForm} name="start_date" label="Start Date" />
                      <DatePickerField form={employeeOrdersForm} name="end_date" label="End Date" />
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Run Query
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Sales by Provider */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Sales by Provider</CardTitle>
                  <CardDescription>Get product sales summary by shipping provider</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...productSalesByProviderForm}>
                    <form onSubmit={productSalesByProviderForm.handleSubmit(onProductSalesByProviderSubmit)} className="space-y-4">
                      <FormField
                        control={productSalesByProviderForm.control}
                        name="order_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {orderStatuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status.replace(/([A-Z])/g, ' $1').trim()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={productSalesByProviderForm.control}
                        name="shipping_provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Provider</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {shippingProviders.map((provider) => (
                                  <SelectItem key={provider} value={provider}>
                                    {provider.replace(/_/g, ' ').toUpperCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DatePickerField form={productSalesByProviderForm} name="start_date" label="Start Date" />
                      <DatePickerField form={productSalesByProviderForm} name="end_date" label="End Date" />
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Run Query
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Sales by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Type</CardTitle>
                  <CardDescription>Get sales summary grouped by sale type</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...salesByTypeForm}>
                    <form onSubmit={salesByTypeForm.handleSubmit(onSalesByTypeSubmit)} className="space-y-4">
                      <FormField
                        control={salesByTypeForm.control}
                        name="sale_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sale Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {saleTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.toUpperCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DatePickerField form={salesByTypeForm} name="start_date" label="Start Date" />
                      <DatePickerField form={salesByTypeForm} name="end_date" label="End Date" />
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Run Query
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inventory Transaction Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Transaction Logs</CardTitle>
                  <CardDescription>Get inventory transaction logs by location type</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...inventoryTransactionLogsForm}>
                    <form onSubmit={inventoryTransactionLogsForm.handleSubmit(onInventoryTransactionLogsSubmit)} className="space-y-4">
                      <FormField
                        control={inventoryTransactionLogsForm.control}
                        name="location_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {locationTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.toUpperCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DatePickerField form={inventoryTransactionLogsForm} name="start_date" label="Start Date" />
                      <DatePickerField form={inventoryTransactionLogsForm} name="end_date" label="End Date" />
                      <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Run Query
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {renderResults()}
      </div>
    </div>
  );
}
