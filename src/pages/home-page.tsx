import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle,
  Crown,
  Database,

  Shield,
  ShoppingCart,
  UserCheck,
  Zap,
} from "lucide-react"
import { Link } from "react-router-dom"

export default function LandingPage() {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-blue-400" />,
      title: "Real-time Order Management",
      description:
        "WebSocket-powered real-time updates ensure your team stays synchronized with live order tracking and instant notifications.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-400" />,
      title: "Role-based Dashboards",
      description:
        "Customized dashboards for Admin, Moderator, and Franchise roles with tailored insights and controls for each user type.",
    },
    {
      icon: <Shield className="h-8 w-8 text-green-400" />,
      title: "Secure Authentication",
      description:
        "Enterprise-grade security with robust user management, role-based access control, and comprehensive audit trails.",
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-indigo-400" />,
      title: "WooCommerce Integration",
      description:
        "Seamless integration with WooCommerce for unified e-commerce and ERP operations across all your sales channels.",
    },
  ]

  const dashboardOptions = [
    {
      title: "Admin Dashboard",
      description:
        "Complete system control with advanced analytics, user management, and comprehensive reporting capabilities.",
      icon: <Crown className="h-8 w-8" />,
      color: "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
      href: "/login",
    },
    {
      title: "Moderator Dashboard",
      description: "Streamlined interface for order processing, inventory oversight, and team coordination tools.",
      icon: <UserCheck className="h-8 w-8" />,
      color: "bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800",
      href: "/moderator/login",
    },
    {
      title: "Franchise Dashboard",
      description: "Focused view for franchise operations with location-specific metrics and performance tracking.",
      icon: <Building2 className="h-8 w-8" />,
      color: "bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
      href: "/myFranchise/login",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">My ERP</span>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex bg-gray-800 text-gray-200 hover:bg-gray-700">
              Enterprise Ready
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-blue-950 text-blue-300 hover:bg-blue-900 border-blue-800">
            <Zap className="h-4 w-4 mr-1" />
            Real-time Business Management
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Streamline Your Business with{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">My ERP</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
            A modular, real-time enterprise resource planning platform that unifies order management, inventory
            tracking, and user management. Built for modern businesses with role-based dashboards and seamless
            WooCommerce integration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features for Modern Business</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Everything you need to manage your enterprise operations efficiently and scale your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-gray-800 bg-gray-900/50 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:border-gray-700"
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gray-800 rounded-full w-fit">{feature.icon}</div>
                  <CardTitle className="text-lg font-semibold text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-950 to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Dashboard</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Access your personalized dashboard based on your role. Each interface is tailored to your specific needs
              and responsibilities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {dashboardOptions.map((option, index) => (
              <Card
                key={index}
                className="border-gray-800 bg-gray-900/50 shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden hover:border-gray-700"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gray-800 rounded-full text-gray-200">{option.icon}</div>
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white">{option.title}</CardTitle>
                  <CardDescription className="text-gray-300 leading-relaxed">{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    asChild
                    className={`w-full text-white font-semibold py-3 transition-all duration-300 ${option.color}`}
                    size="lg"
                  >
                    <Link to={option.href}>
                      Access Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-900/30">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">99.9%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">500+</div>
              <div className="text-gray-400">Businesses</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">24/7</div>
              <div className="text-gray-400">Support</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-indigo-400 mb-2">Real-time</div>
              <div className="text-gray-400">Updates</div>
            </div>
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
                <span className="text-2xl font-bold">My ERP</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Empowering businesses with intelligent ERP solutions. Streamline operations, boost productivity, and
                scale with confidence.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    API
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
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} My ERP. All rights reserved.</p>
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
