import { useQuery } from "@tanstack/react-query";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, CheckCircle } from "lucide-react";
import { ProductReview } from "@shared/schema";

interface ReviewsListProps {
  productId: number;
}

export function ReviewsList({ productId }: ReviewsListProps) {
  const { data: reviews = [], isLoading } = useQuery<ProductReview[]>({
    queryKey: ["/api/reviews", productId],
    queryFn: async () => {
      const response = await fetch(`/api/reviews/${productId}`);
      if (!response.ok) return [];
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-500">Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-md font-semibold">Reviews ({reviews.length})</h4>
      {reviews.map((review) => (
        <Card key={review.id} className="border-gray-100">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-primary">
                  {review.customerName.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Review Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {review.customerName}
                    </span>
                    {review.isVerified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
                
                <StarRating rating={review.rating} size="sm" />
                
                {review.comment && (
                  <p className="text-gray-600 leading-relaxed mt-3">
                    {review.comment}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ReviewsList;