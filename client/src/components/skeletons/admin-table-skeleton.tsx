import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminTableSkeletonProps {
  rows?: number;
  columns?: number;
  hasActions?: boolean;
}

export function AdminTableSkeleton({ 
  rows = 5, 
  columns = 4, 
  hasActions = true 
}: AdminTableSkeletonProps) {
  const totalColumns = hasActions ? columns + 1 : columns;
  
  return (
    <Card data-testid="skeleton-admin-table">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {[...Array(totalColumns)].map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(rows)].map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {[...Array(totalColumns)].map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    {hasActions && colIndex === totalColumns - 1 ? (
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    ) : (
                      <Skeleton className="h-4 w-full" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}