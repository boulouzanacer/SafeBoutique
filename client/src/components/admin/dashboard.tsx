import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, DollarSign, Package, Users } from "lucide-react";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  revenue: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="p-3 bg-gray-200 rounded-lg w-12 h-12"></div>
                  <div className="ml-4">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      testId: "stat-orders"
    },
    {
      title: "Revenue",
      value: `$${(stats?.revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      testId: "stat-revenue"
    },
    {
      title: "Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      testId: "stat-products"
    },
    {
      title: "Customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      testId: "stat-customers"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold" data-testid="text-dashboard-title">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-3 ${card.bgColor} rounded-lg`}>
                  <card.icon className={`${card.iconColor} h-6 w-6`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid={card.testId}>
                    {card.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}