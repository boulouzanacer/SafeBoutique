import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <header className="bg-white shadow-sm border-b" data-testid="skeleton-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo skeleton */}
          <div className="flex-shrink-0">
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Search bar skeleton */}
          <div className="flex-1 max-w-lg mx-8">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Navigation skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
    </header>
  );
}