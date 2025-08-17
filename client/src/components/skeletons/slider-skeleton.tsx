import { Skeleton } from "@/components/ui/skeleton";

export function SliderSkeleton() {
  return (
    <div className="relative h-96 w-full overflow-hidden" data-testid="skeleton-slider">
      <Skeleton className="w-full h-full" />
      
      {/* Navigation dots skeleton */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="w-3 h-3 rounded-full" />
        ))}
      </div>
      
      {/* Navigation arrows skeleton */}
      <Skeleton className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full" />
      <Skeleton className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full" />
    </div>
  );
}