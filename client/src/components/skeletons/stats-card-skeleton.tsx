import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function StatsCardSkeleton() {
  return (
    <Card data-testid="skeleton-stats-card">
      <CardContent className="p-6">
        <div className="flex items-center">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="ml-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}