import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/star-rating";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";

interface ReviewFormProps {
  productId: number;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: {
      productId: number;
      rating: number;
      customerName: string;
      customerEmail: string;
      comment: string;
    }) => {
      return apiRequest("/api/reviews", "POST", reviewData);
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your review! It will be visible once approved.",
        className: "border-green-200 bg-green-50 text-green-800"
      });
      
      // Reset form
      setRating(0);
      setCustomerName("");
      setCustomerEmail("");
      setComment("");
      
      // Invalidate and refetch product data
      queryClient.invalidateQueries({ queryKey: ["/api/products", productId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", productId] });
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        className: "border-red-200 bg-red-50 text-red-800"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting your review.",
        className: "border-yellow-200 bg-yellow-50 text-yellow-800"
      });
      return;
    }
    
    if (!customerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name.",
        className: "border-yellow-200 bg-yellow-50 text-yellow-800"
      });
      return;
    }

    submitReviewMutation.mutate({
      productId,
      rating,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      comment: comment.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerName">Name *</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your name"
            required
            data-testid="input-customer-name"
          />
        </div>
        <div>
          <Label htmlFor="customerEmail">Email (optional)</Label>
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="your.email@example.com"
            data-testid="input-customer-email"
          />
        </div>
      </div>
      
      <div>
        <Label>Rating *</Label>
        <div className="mt-1">
          <StarRating
            rating={rating}
            interactive={true}
            onRatingChange={setRating}
            size="lg"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="comment">Review (optional)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
          data-testid="textarea-comment"
        />
      </div>
      
      <Button
        type="submit"
        disabled={submitReviewMutation.isPending}
        className="w-full md:w-auto"
        data-testid="button-submit-review"
      >
        {submitReviewMutation.isPending ? (
          "Submitting..."
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Review
          </>
        )}
      </Button>
    </form>
  );
}

export default ReviewForm;