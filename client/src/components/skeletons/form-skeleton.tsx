import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface FormSkeletonProps {
  fields?: number;
  hasTextarea?: boolean;
  hasButtons?: boolean;
}

export function FormSkeleton({ 
  fields = 3, 
  hasTextarea = false, 
  hasButtons = true 
}: FormSkeletonProps) {
  return (
    <Card data-testid="skeleton-form">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(fields)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        
        {hasTextarea && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
        
        {hasButtons && (
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}