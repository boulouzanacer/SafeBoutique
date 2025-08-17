import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card className="h-full" data-testid="skeleton-product-card">
      <CardContent className="p-4">
        {/* Image skeleton */}
        <Skeleton className="w-full h-48 mb-4" />
        
        {/* Title skeleton */}
        <Skeleton className="h-5 w-3/4 mb-2" />
        
        {/* Description skeleton */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        
        {/* Price skeleton */}
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Rating skeleton */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded" />
          ))}
          <Skeleton className="h-4 w-12 ml-2" />
        </div>
        
        {/* Button skeleton */}
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}