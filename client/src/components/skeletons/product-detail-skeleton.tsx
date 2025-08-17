import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-testid="skeleton-product-detail">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <Card>
          <CardContent className="p-0">
            <Skeleton className="w-full h-96 rounded-lg" />
          </CardContent>
        </Card>

        {/* Product info skeleton */}
        <div className="space-y-6">
          {/* Title and status */}
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-24" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-5 rounded" />
            ))}
            <Skeleton className="h-4 w-20 ml-2" />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-20 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Quantity and buttons */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>

      {/* Reviews section skeleton */}
      <div className="mt-12">
        <Skeleton className="h-6 w-32 mb-6" />
        
        {/* Review form skeleton */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-6 w-6 rounded" />
                ))}
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Reviews list skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Skeleton key={j} className="h-4 w-4 rounded" />
                      ))}
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}