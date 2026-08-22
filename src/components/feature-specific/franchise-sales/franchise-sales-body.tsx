import { RootState } from "@/app/store";
import { franchiseExchangesColumns } from "@/components/feature-specific/franchise-sales/franchise-exchanges-columns";
import { franchiseReturnsColumns } from "@/components/feature-specific/franchise-sales/franchise-returns-columns";
import { franchiseSalesColumns } from "@/components/feature-specific/franchise-sales/franchise-sales-columns";
import FranchiseSalesBreakdownAccordion, {
  buildSalesBreakdownMetrics,
} from "@/components/feature-specific/franchise-sales/franchise-sales-breakdown-cards";
import {
  mapExchangesToRows,
  mapReturnsToRows,
} from "@/components/feature-specific/sales/sale-activity-columns";
import {
  applySalesDateRange,
  SalesActivityTabs,
} from "@/components/feature-specific/sales/sales-activity-tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  getFranchiseSaleExchanges,
  getFranchiseSaleReturns,
  getFranchiseSales,
  getFranchiseSalesTotal,
} from "@/services/franchise-service";
import { getSalesCount } from "@/services/sale-service";
import { useQuery } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

const emptyBreakdown = {
  salesCount: 0,
  salesAmount: 0,
  returnsCount: 0,
  returnsAmount: 0,
  exchangesCount: 0,
  exchangesAmount: 0,
};


export default function () {
  const franchise = useSelector((state: RootState) => state.franchise.franchise);
  if (!franchise) return;
  
  const [dateRange, setDateRange] = useState({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  // State for benefits visibility and password dialog
  const [showBenefits, setShowBenefits] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const datesEnabled = !!dateRange.from && !!dateRange.to;

  // Query for today's total
  const { data: todayTotal, isLoading: todayTotalLoading } = useQuery({
    queryKey: ["franchise-sales-total-today", franchise.ID],
    queryFn: () =>
      getFranchiseSalesTotal(franchise.ID, startOfDay(new Date()), endOfDay(new Date())),
  });

  // Query for custom date range total
  const { data: rangeTotal, isLoading: rangeTotalLoading } = useQuery({
    queryKey: ["franchise-sales-total-range", franchise.ID, dateRange.from, dateRange.to],
    queryFn: () => getFranchiseSalesTotal(franchise.ID, dateRange.from, dateRange.to),
    enabled: datesEnabled,
  });

  
  // Query for today's sales count
  const { data: salesCount } = useQuery({
    queryKey: ["sales-count", franchise.ID],
    queryFn: () =>
      getSalesCount({
        franchise_id: franchise.ID.toString(),
        start_date: startOfDay(new Date()).toISOString(),
        end_date: endOfDay(new Date()).toISOString(),
        sale_type: "franchise",
      }),
  });

  // Query for custom date range sales count
  const { data: rangeSalesCount } = useQuery({
    queryKey: ["sales-count-range", franchise.ID, dateRange.from, dateRange.to],
    queryFn: () =>
      getSalesCount({
        franchise_id: franchise.ID.toString(),
        start_date: startOfDay(dateRange.from).toISOString(),
        end_date: endOfDay(dateRange.to).toISOString(),
        sale_type: "franchise",
      }),
    enabled: datesEnabled,
  }); 

  const { data } = useQuery({
    queryKey: ["sales", franchise.ID, dateRange.from, dateRange.to],
    queryFn: () => getFranchiseSales(franchise.ID, dateRange),
    enabled: datesEnabled,
  });
  const { data: returnsData } = useQuery({
    queryKey: ["sales", "returns", franchise.ID, dateRange.from, dateRange.to],
    queryFn: () => getFranchiseSaleReturns(franchise.ID, dateRange),
    enabled: datesEnabled,
  });
  const { data: exchangesData } = useQuery({
    queryKey: ["sales", "exchanges", franchise.ID, dateRange.from, dateRange.to],
    queryFn: () => getFranchiseSaleExchanges(franchise.ID, dateRange),
    enabled: datesEnabled,
  });
  const { toast } = useToast();

  const sales = data?.data ?? [];
  const returnsRows = useMemo(
    () => mapReturnsToRows(returnsData?.data),
    [returnsData?.data]
  );
  const exchangesRows = useMemo(
    () => mapExchangesToRows(exchangesData?.data),
    [exchangesData?.data]
  );

  const todayBreakdown = useMemo(
    () => buildSalesBreakdownMetrics(todayTotal?.data, emptyBreakdown),
    [todayTotal?.data]
  );

  const rangeBreakdown = useMemo(
    () => buildSalesBreakdownMetrics(rangeTotal?.data, emptyBreakdown),
    [rangeTotal?.data]
  );

  useEffect(() => {
    toast({
      title: "Sales Loaded",
      description: `Loaded ${data?.data?.length} sales`,
    });
  }, [data?.data, toast]);

  // Handle password verification
  const handlePasswordSubmit = () => {
    if (password === "COSMOS2025") {
      setShowBenefits(true);
      setIsPasswordDialogOpen(false);
      setPassword("");
      setPasswordError("");
      toast({
        title: "Access Granted",
        description: "Benefits cards are now visible",
      });
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsPasswordDialogOpen(false);
    setPassword("");
    setPasswordError("");
  };

  // Toggle benefits visibility
  const toggleBenefits = () => {
    if (showBenefits) {
      setShowBenefits(false);
      toast({
        title: "Benefits Hidden",
        description: "Benefits cards are now hidden",
      });
    } else {
      setIsPasswordDialogOpen(true);
    }
  };

  return (
    <div className="pt-4 space-y-4">
      {/* Benefits Toggle Button */}
      <div className="flex justify-end">
        <Button
          onClick={toggleBenefits}
          variant="outline"
          className="flex items-center gap-2"
        >
          {showBenefits ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showBenefits ? "Hide Benefits" : "Show Benefits"}
        </Button>
      </div>

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
            <DialogDescription>
              Please enter the password to view the benefits cards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit();
                  }
                }}
                placeholder="Enter password"
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Sales Total</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat("en-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(todayTotal?.data?.total_amount || 0)}
            </p>
            <FranchiseSalesBreakdownAccordion
              metrics={todayBreakdown}
              isLoading={todayTotalLoading}
            />
          </CardContent>
        </Card>
        
        {/* Benefits Card - Conditionally Rendered */}
        {showBenefits && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Franchise's Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format((todayTotal?.data?.total_amount || 0) - (todayTotal?.data?.total_franchise_price || 0))}
              </p>
              <div className="text-lg text-white flex items-center gap-2">
                <p>
                  <span className="font-bold">
                    {salesCount?.data?.sales_count}
                  </span>{" "}
                  sales
                </p>
                <p>
                  <span className="font-bold">
                    {salesCount?.data?.sale_items_count}
                  </span>{" "}
                  items
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Custom Range Sales Total</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DatePickerWithRange
              date={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => applySalesDateRange(range, setDateRange)}
            />
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat("en-DZ", {
                style: "currency",
                currency: "DZD",
              }).format(rangeTotal?.data?.total_amount || 0)}
            </p>
            <div className="text-lg text-muted-foreground flex items-center gap-2">
              <p>
                <span className="font-bold text-foreground">
                  {rangeSalesCount?.data?.sales_count}
                </span>{" "}
                sales
              </p>
              <p>
                <span className="font-bold text-foreground">
                  {rangeSalesCount?.data?.sale_items_count}
                </span>{" "}
                items
              </p>
            </div>
            <FranchiseSalesBreakdownAccordion
              metrics={rangeBreakdown}
              isLoading={rangeTotalLoading}
            />
          </CardContent>
        </Card>
        
        {/* Benefits Card - Conditionally Rendered */}
        {showBenefits && (
          <Card>
            <CardHeader>
              <CardTitle>Custom Range Franchise's Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DatePickerWithRange
                date={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => applySalesDateRange(range, setDateRange)}
              />
              <p className="text-3xl font-bold">
                {new Intl.NumberFormat("en-DZ", {
                  style: "currency",
                  currency: "DZD",
                }).format((rangeTotal?.data?.total_amount || 0) - (rangeTotal?.data?.total_franchise_price || 0))}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="my-4" />

      <SalesActivityTabs
        sales={sales}
        returnsRows={returnsRows}
        exchangesRows={exchangesRows}
        salesColumns={franchiseSalesColumns}
        returnsColumns={franchiseReturnsColumns}
        exchangesColumns={franchiseExchangesColumns}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
    </div>
  );
}
