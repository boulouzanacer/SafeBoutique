import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCardSkeleton } from "@/components/skeletons/stats-card-skeleton";
import { ShoppingCart, DollarSign, Package, Users, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import AnimatedText from "@/components/animated-text";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  revenue: number;
}

export default function Dashboard() {
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { t } = useTranslation();
  
  const { data: stats, isLoading, refetch, isFetching } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: isAutoRefresh ? 30000 : false, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true
  });

  // Update lastUpdated when data changes
  useEffect(() => {
    if (stats) {
      setLastUpdated(new Date());
    }
  }, [stats]);

  // Manual refresh function
  const handleManualRefresh = () => {
    refetch();
  };

  // Format time ago helper
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: t("admin.totalOrders"),
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      testId: "stat-orders"
    },
    {
      title: t("admin.revenue"),
      value: formatCurrency(stats?.revenue || 0),
      icon: DollarSign,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      testId: "stat-revenue"
    },
    {
      title: t("admin.totalProducts"),
      value: stats?.totalProducts || 0,
      icon: Package,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      testId: "stat-products"
    },
    {
      title: t("admin.totalCustomers"),
      value: stats?.totalCustomers || 0,
      icon: Users,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      testId: "stat-customers"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with refresh controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" data-testid="text-dashboard-title">
            <AnimatedText translationKey="admin.dashboard" /> Overview
          </h2>
          <p className="text-sm text-gray-500" data-testid="text-last-updated">
            <AnimatedText translationKey="admin.lastUpdated" />: {getTimeAgo(lastUpdated)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isAutoRefresh}
              onChange={(e) => setIsAutoRefresh(e.target.checked)}
              className="rounded"
              data-testid="checkbox-auto-refresh"
            />
            <AnimatedText translationKey="admin.autoRefresh" /> (30s)
          </label>
          <button
            onClick={handleManualRefresh}
            disabled={isFetching}
            className={`flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              isFetching ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            data-testid="button-manual-refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <AnimatedText translationKey="admin.manualRefresh" />
          </button>
        </div>
      </div>
      
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