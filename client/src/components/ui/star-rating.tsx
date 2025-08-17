import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showText?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  showText = false,
  className
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center" onMouseLeave={handleMouseLeave}>
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= displayRating;
          const isPartial = !Number.isInteger(displayRating) && 
                           starRating === Math.ceil(displayRating) && 
                           starRating > displayRating;

          return (
            <button
              key={index}
              type="button"
              className={cn(
                "relative transition-colors",
                interactive ? "cursor-pointer hover:scale-110" : "cursor-default",
                sizeClasses[size]
              )}
              onClick={() => handleStarClick(starRating)}
              onMouseEnter={() => handleStarHover(starRating)}
              disabled={!interactive}
              data-testid={`star-${starRating}`}
            >
              <Star
                className={cn(
                  "transition-colors",
                  sizeClasses[size],
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                )}
              />
              {isPartial && (
                <Star
                  className={cn(
                    "absolute inset-0 transition-colors fill-yellow-400 text-yellow-400",
                    sizeClasses[size]
                  )}
                  style={{
                    clipPath: `inset(0 ${100 - (displayRating % 1) * 100}% 0 0)`
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {showText && (
        <span className={cn("text-gray-600 ml-1", textSizeClasses[size])}>
          {rating > 0 ? `${rating.toFixed(1)} stars` : "No ratings"}
        </span>
      )}
    </div>
  );
}

interface RatingDisplayProps {
  rating: number;
  ratingCount: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function RatingDisplay({
  rating,
  ratingCount,
  size = "md",
  showCount = true,
  className
}: RatingDisplayProps) {
  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StarRating rating={rating} size={size} />
      {showCount && ratingCount > 0 && (
        <span className={cn("text-gray-500", textSizeClasses[size])}>
          ({ratingCount})
        </span>
      )}
    </div>
  );
}