import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AlertCircle,
    ArrowRight,
    BarChart3,
    Building2,
    CheckCircle,
    Database,
    Package,
    ShoppingCart,
    TrendingUp,
    Truck,
    Users,
    Warehouse,
    Zap,
} from "lucide-react"
import { Link } from "react-router-dom"

export default function FeaturesPage() {
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "User Management",
      description:
        "Comprehensive user administration with role-based permissions, access control, and team management capabilities.",
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      href: "/modules/users",
      highlights: ["Role-based Access", "Permission Control", "Team Management"],
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Product Management",
      description:
        "Complete product lifecycle management with variants, categories, barcode generation, and inventory tracking.",
      color: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      href: "/modules/products",
      highlights: ["Product Variants", "Barcode Generation", "Category Management"],
    },
    {
      icon: <Warehouse className="h-8 w-8" />,
      title: "Inventory Control",
      description:
        "Real-time inventory tracking across multiple locations, warehouses, and franchises with automated alerts.",
      color: "from-green-500 to-green-600",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-400",
      href: "/modules/inventory",
      highlights: ["Multi-location Tracking", "Automated Alerts", "Stock Optimization"],
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Sales & Purchases",
      description:
        "Streamlined sales and purchase management with receipt generation, billing, and comprehensive analytics.",
      color: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-400",
      href: "/modules/sales",
      highlights: ["Receipt Generation", "Purchase Orders", "Sales Analytics"],
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Supplier Management",
      description:
        "Efficient supplier relationship management with product catalogs, pricing, and performance tracking.",
      color: "from-indigo-500 to-indigo-600",
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-400",
      href: "/modules/suppliers",
      highlights: ["Supplier Catalogs", "Price Management", "Performance Tracking"],
    },
    {
      icon: <Building2 className="h-8 w-8" />,
      title: "Franchise Management",
      description:
        "Complete franchise oversight with sales monitoring, inventory management, and staff coordination tools.",
      color: "from-teal-500 to-teal-600",
      iconBg: "bg-teal-500/10",
      iconColor: "text-teal-400",
      href: "/modules/franchises",
      highlights: ["Sales Monitoring", "Staff Coordination", "Performance Metrics"],
    },
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "Order & Delivery",
      description:
        "End-to-end order management with delivery tracking, WooCommerce integration, and Yalidine shipping.",
      color: "from-pink-500 to-pink-600",
      iconBg: "bg-pink-500/10",
      iconColor: "text-pink-400",
      href: "/modules/orders",
      highlights: ["WooCommerce Integration", "Delivery Tracking", "Yalidine Shipping"],
    },
    {
      icon: <AlertCircle className="h-8 w-8" />,
      title: "Issue Tracking",
      description:
        "Comprehensive support ticket system for order issues, customer complaints, and internal problem resolution.",
      color: "from-red-500 to-red-600",
      iconBg: "bg-red-500/10",
      iconColor: "text-red-400",
      href: "/modules/issues",
      highlights: ["Support Tickets", "Issue Resolution", "Customer Support"],
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Analytics & Reporting",
      description:
        "Advanced analytics dashboard with sales insights, inventory reports, and franchise performance metrics.",
      color: "from-cyan-500 to-cyan-600",
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-400",
      href: "/modules/analytics",
      highlights: ["Sales Insights", "Inventory Reports", "Performance Metrics"],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">MyERP</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link to="/features" className="text-blue-400 font-medium">
                Features
              </Link>
              <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-blue-950 text-blue-300 hover:bg-blue-900 border-blue-800">
            <Zap className="h-4 w-4 mr-1" />
            Complete ERP Solution
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Modern Business
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
            Discover the comprehensive suite of tools designed to streamline your business operations, from user
            management to advanced analytics. Each module is built for efficiency and scalability.
          </p>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>9 Core Modules</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Real-time Updates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Mobile Responsive</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 transition-all duration-300 hover:border-gray-700 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className={`w-fit p-3 rounded-lg ${feature.iconBg} mb-4`}>
                    <div className={feature.iconColor}>{feature.icon}</div>
                  </div>
                  <CardTitle className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300 leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {feature.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    asChild
                    className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white font-medium transition-all duration-300 group-hover:shadow-lg`}
                  >
                    <Link to={feature.href}>
                      Go to Module
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 px-4 bg-gray-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Seamless Integrations</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              MyERP integrates with your existing tools and platforms for a unified business experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">WooCommerce</h3>
              <p className="text-sm text-gray-400">E-commerce Integration</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Truck className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Yalidine</h3>
              <p className="text-sm text-gray-400">Shipping & Delivery</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Analytics</h3>
              <p className="text-sm text-gray-400">Business Intelligence</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Database className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">Real-time</h3>
              <p className="text-sm text-gray-400">Live Updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start using MyERP today and experience the power of integrated business management. Choose your role and
            access your personalized dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-12 px-4 border-t border-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">MyERP</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Empowering businesses with intelligent ERP solutions. Streamline operations, boost productivity, and
                scale with confidence.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/modules/users" className="hover:text-white transition-colors">
                    User Management
                  </Link>
                </li>
                <li>
                  <Link to="/modules/inventory" className="hover:text-white transition-colors">
                    Inventory Control
                  </Link>
                </li>
                <li>
                  <Link to="/modules/sales" className="hover:text-white transition-colors">
                    Sales & Purchases
                  </Link>
                </li>
                <li>
                  <Link to="/modules/analytics" className="hover:text-white transition-colors">
                    Analytics
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} MyERP. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
