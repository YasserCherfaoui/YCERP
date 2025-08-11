// Main charges page for company dashboard - Unified Charges Hub
import { RootState } from "@/app/store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertCircle,
    BarChart3,
    Calculator,
    DollarSign,
    Home,
    Megaphone,
    Package,
    TrendingUp,
    Truck,
    Undo2,
    Users,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function ChargesPage() {
  const navigate = useNavigate();
  const company = useSelector((state: RootState) => state.company.company);
  const location = useLocation();
  const params = useParams();

  // Mock analytics data - in real implementation, this would come from Redux
  const analytics = {
    totalCharges: 156,
    totalAmount: 2450000,
    pendingCharges: 23,
    approvedCharges: 133,
    recentActivity: 12,
  };

  // Handle navigation to charge types
  const handleChargeTypeNavigation = (href: string) => {
    // Get company ID from URL params or fallback to parsing
    const companyId = params.companyID || location.pathname.split('/')[2];
    
    if (companyId) {
      const targetPath = `/company/${companyId}/${href}`;
      console.log('Navigating to:', targetPath);
      navigate(targetPath);
    } else {
      // Fallback to relative navigation
      console.log('Fallback navigation to:', href);
      navigate(href);
    }
  };

  if (!company) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600">Company information is required to view charges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Charges Management</h1>
          <p className="text-gray-600">Manage all business charges and expenses</p>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCharges}</div>
            <p className="text-xs text-gray-500">
              {analytics.pendingCharges} pending approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'DZD',
                minimumFractionDigits: 0,
              }).format(analytics.totalAmount)}
            </div>
            <p className="text-xs text-gray-500">
              Avg: {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'DZD',
                minimumFractionDigits: 0,
              }).format(analytics.totalAmount / analytics.totalCharges)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.approvedCharges}</div>
            <p className="text-xs text-gray-500">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'DZD',
                minimumFractionDigits: 0,
              }).format(analytics.totalAmount * 0.85)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.recentActivity}</div>
            <p className="text-xs text-gray-500">
              New charges this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charge Type Navigation */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Charge Types</h2>
          <p className="text-gray-600 mb-6">Select a charge type to manage specific expenses</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {chargeTypes.map((item, index) => (
            <Card
              key={index}
              onClick={() => handleChargeTypeNavigation(item.href)}
              className="flex flex-col h-48 w-48 justify-center items-center hover:bg-gray-100 hover:cursor-pointer hover:text-black"
            >
              <CardContent className="flex flex-col justify-center items-center gap-2">
                <item.icon size={48} />
                <h3 className="text-xl font-bold">{item.label}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:bg-gray-50 cursor-pointer" onClick={() => handleChargeTypeNavigation('charges')}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">View All Charges</h3>
                  <p className="text-sm text-gray-600">See all charges in one place</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-gray-50 cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold">Analytics</h3>
                  <p className="text-sm text-gray-600">View charge analytics and trends</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-gray-50 cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div>
                  <h3 className="font-semibold">Pending Approvals</h3>
                  <p className="text-sm text-gray-600">{analytics.pendingCharges} charges waiting</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${activity.iconBg}`}>
                    <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                  </div>
                  <Badge variant={activity.badgeVariant as any}>{activity.badgeText}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const chargeTypes = [
  {
    label: "Exchange Rates",
    icon: DollarSign,
    href: "exchange-rates",
  },
  {
    label: "Salaries",
    icon: Users,
    href: "salaries",
  },
  {
    label: "Boxing & Packaging",
    icon: Package,
    href: "boxing",
  },
  {
    label: "Shipping",
    icon: Truck,
    href: "shipping",
  },
  {
    label: "Returns",
    icon: Undo2,
    href: "returns",
  },
  {
    label: "Advertising",
    icon: Megaphone,
    href: "advertising",
  },
  {
    label: "Rent & Utilities",
    icon: Home,
    href: "rent-utilities",
  },
  {
    label: "All Charges",
    icon: Calculator,
    href: "charges",
  },
];

const recentActivities = [
  {
    title: "New Salary Charge Created",
    description: "Employee salary for March 2024",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badgeText: "Pending",
    badgeVariant: "secondary",
  },
  {
    title: "Exchange Rate Updated",
    description: "EUR/DZD rate changed to 145.50",
    icon: DollarSign,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    badgeText: "Updated",
    badgeVariant: "default",
  },
  {
    title: "Shipping Charge Approved",
    description: "Yalidine delivery charge approved",
    icon: Truck,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    badgeText: "Approved",
    badgeVariant: "default",
  },
  {
    title: "Advertising Campaign Charge",
    description: "Facebook ads campaign expense",
    icon: Megaphone,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    badgeText: "Pending",
    badgeVariant: "secondary",
  },
];