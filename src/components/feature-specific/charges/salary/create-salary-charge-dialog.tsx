import { RootState } from "@/app/store";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getDeliveryEmployees } from "@/services/delivery-service";
import { createSalaryCharge } from "@/services/salary-service";
import { getUsersByCompany } from "@/services/user-service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { z } from "zod";

// Schema for salary charge creation
const createSalaryChargeSchema = z.object({
  employee_type: z.enum(["delivery", "moderator", "warehouse", "office"], {
    required_error: "Employee type is required",
  }),
  employee_id: z.number().min(1, "Employee is required"),
  employee_name: z.string().min(1, "Employee name is required"),
  base_salary: z.number().min(0, "Base salary must be non-negative"),
  bonus: z.number().min(0, "Bonus must be non-negative").optional(),
  allowances: z.number().min(0, "Allowances must be non-negative").optional(),
  overtime_hours: z.number().min(0, "Overtime hours must be non-negative").optional(),
  overtime_rate: z.number().min(0, "Overtime rate must be non-negative").optional(),
  payment_method: z.enum(["cash", "bank_transfer", "check"], {
    required_error: "Payment method is required",
  }),
  payment_frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly"], {
    required_error: "Payment frequency is required",
  }),
  company_id: z.number().min(1, "Company ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  delivery_employee_id: z.number().optional(),
  user_id: z.number().optional(),
});

type CreateSalaryChargeFormData = z.infer<typeof createSalaryChargeSchema>;

interface CreateSalaryChargeDialogProps {
  /** Whether the dialog is open */
  open?: boolean;
  /** Callback when dialog open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

export default function CreateSalaryChargeDialog({
  open,
  onOpenChange,
  className,
}: CreateSalaryChargeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get company and user from Redux state
  const company = useSelector((state: RootState) => state.company.company);
  
  const dialogOpen = open ?? isOpen;
  const setDialogOpen = onOpenChange ?? setIsOpen;

  const form = useForm<CreateSalaryChargeFormData>({
    resolver: zodResolver(createSalaryChargeSchema),
    defaultValues: {
      company_id: company?.ID ?? 0,
      employee_type: "warehouse",
      payment_method: "bank_transfer",
      payment_frequency: "monthly",
      date: new Date().toISOString().split('T')[0],
      base_salary: 0,
      bonus: 0,
      allowances: 0,
      overtime_hours: 0,
      overtime_rate: 0,
      delivery_employee_id: undefined,
      user_id: undefined,
    },
  });

  const selectedEmployeeType = form.watch("employee_type");

  // Fetch delivery employees if delivery type is selected
  const {
    data: deliveryEmployeesData,
    isLoading: deliveryEmployeesLoading,
    error: deliveryEmployeesError,
  } = useQuery({
    queryKey: ["delivery-employees", company?.ID],
    queryFn: () => getDeliveryEmployees(1),
    enabled: selectedEmployeeType === "delivery" && !!company?.ID,
  });

  // Fetch users if moderator type is selected
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users", company?.ID],
    queryFn: () => getUsersByCompany(company?.ID ?? 0),
    enabled: selectedEmployeeType === "moderator" && !!company?.ID,
  });

  const deliveryEmployees = deliveryEmployeesData?.data || [];
  const users = usersData?.data || [];

  const mutation = useMutation({
    mutationFn: createSalaryCharge,
    onSuccess: () => {
      toast({
        title: "Salary Charge Created",
        description: "Salary charge was created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["salary-charges"] });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Salary Charge",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateSalaryChargeFormData) => {
    mutation.mutate(data);
  };

  const handleEmployeeTypeChange = (value: string) => {
    form.setValue("employee_type", value as "delivery" | "moderator" | "warehouse" | "office");
    
    // Reset employee-specific fields based on type
    if (value === "delivery") {
      form.setValue("delivery_employee_id", undefined);
      form.setValue("user_id", undefined);
      form.setValue("employee_id", 0);
      form.setValue("employee_name", "");
    } else if (value === "moderator") {
      form.setValue("user_id", undefined);
      form.setValue("delivery_employee_id", undefined);
      form.setValue("employee_id", 0);
      form.setValue("employee_name", "");
    } else {
      // For warehouse and office employees
      form.setValue("delivery_employee_id", undefined);
      form.setValue("user_id", undefined);
      form.setValue("employee_id", 0);
      form.setValue("employee_name", "");
    }
  };

  const handleEmployeeChange = (value: string) => {
    const employeeId = Number(value);
    form.setValue("employee_id", employeeId);

    if (selectedEmployeeType === "delivery") {
      const selectedEmployee = deliveryEmployees.find(emp => emp.ID === employeeId);
      if (selectedEmployee) {
        form.setValue("employee_name", selectedEmployee.name);
        form.setValue("delivery_employee_id", employeeId);
      }
    } else if (selectedEmployeeType === "moderator") {
      const selectedUser = users.find(user => user.ID === employeeId);
      if (selectedUser) {
        form.setValue("employee_name", selectedUser.full_name);
        form.setValue("user_id", employeeId);
      }
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Salary Charge
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Salary Charge</DialogTitle>
          <DialogDescription>
            Create a new salary charge for an employee. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-[calc(90vh-200px)] pr-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="employee_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={handleEmployeeTypeChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="delivery">Delivery</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dynamic Employee Selection */}
                {selectedEmployeeType === "delivery" && (
                  <FormField
                    control={form.control}
                    name="employee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Employee</FormLabel>
                        <Select
                          value={field.value !== undefined && field.value !== null ? field.value.toString() : ""}
                          onValueChange={handleEmployeeChange}
                          disabled={deliveryEmployeesLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                deliveryEmployeesLoading 
                                  ? "Loading delivery employees..." 
                                  : "Select delivery employee"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {deliveryEmployees.length > 0 ? (
                              deliveryEmployees.map((employee) => (
                                <SelectItem key={employee.ID} value={employee.ID.toString()}>
                                  {employee.name} ({employee.email})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-employees" disabled>
                                No delivery employees available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {deliveryEmployeesError && (
                          <FormMessage>
                            Error loading delivery employees: {deliveryEmployeesError.message}
                          </FormMessage>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedEmployeeType === "moderator" && (
                  <FormField
                    control={form.control}
                    name="employee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User</FormLabel>
                        <Select
                          value={field.value !== undefined && field.value !== null ? field.value.toString() : ""}
                          onValueChange={handleEmployeeChange}
                          disabled={usersLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                usersLoading 
                                  ? "Loading users..." 
                                  : "Select user"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.length > 0 ? (
                              users.map((user) => (
                                <SelectItem key={user.ID} value={user.ID.toString()}>
                                  {user.full_name} ({user.email})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-users" disabled>
                                No users available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {usersError && (
                          <FormMessage>
                            Error loading users: {usersError.message}
                          </FormMessage>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(selectedEmployeeType === "warehouse" || selectedEmployeeType === "office") && (
                  <FormField
                    control={form.control}
                    name="employee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter employee ID"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="employee_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Employee name will be auto-filled" {...field} readOnly />
                      </FormControl>
                      <FormDescription>
                        This will be automatically filled when you select an employee
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="base_salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Salary (DZD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bonus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bonus (DZD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="allowances"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allowances (DZD)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="overtime_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overtime Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="overtime_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overtime Rate (DZD/hour)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="payment_frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Frequency</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter salary charge title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter additional details (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating..." : "Create Salary Charge"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 