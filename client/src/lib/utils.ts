import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Product } from "@shared/schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} DA`
}

export interface ProductPricing {
  currentPrice: number;
  originalPrice?: number;
  isOnPromotion: boolean;
  promoEndDate?: Date;
  discountPercentage?: number;
}

export function getProductPricing(product: Product): ProductPricing {
  const now = new Date();
  const regularPrice = product.pv1Ht || 0;
  
  // Use pp1Ht to determine promotion: 0 = no promotion, any other value = promotional price
  const hasPromoPrice = product.pp1Ht && product.pp1Ht > 0;
  
  // Check promotion date validity
  let isDateValid = true;
  if (product.d1 && product.d2) {
    const startDate = new Date(product.d1);
    const endDate = new Date(product.d2);
    isDateValid = now >= startDate && now <= endDate;
  } else if (product.d1) {
    const startDate = new Date(product.d1);
    isDateValid = now >= startDate;
  } else if (product.d2) {
    const endDate = new Date(product.d2);
    isDateValid = now <= endDate;
  }
  
  // Check if promotion is active - only based on pp1Ht value and date validity
  const isOnPromotion = hasPromoPrice && isDateValid;
  
  if (isOnPromotion) {
    const promoPrice = product.pp1Ht!;
    const discountPercentage = Math.round((1 - promoPrice / regularPrice) * 100);
    
    return {
      currentPrice: promoPrice,
      originalPrice: regularPrice,
      isOnPromotion: true,
      promoEndDate: product.d2 ? new Date(product.d2) : undefined,
      discountPercentage: discountPercentage > 0 ? discountPercentage : undefined
    };
  }
  
  return {
    currentPrice: regularPrice,
    isOnPromotion: false
  };
}

export function formatPromoEndDate(date: Date): string {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Ends today!";
  } else if (diffDays === 1) {
    return "Ends tomorrow!";
  } else if (diffDays > 1) {
    return `${diffDays} days left`;
  } else {
    return "Promotion expired";
  }
}

/**
 * Standardized photo URL handling for consistent image display across the app
 * Supports multiple photo formats: base64, Google Cloud Storage URLs, object storage paths
 */
export function getPhotoUrl(photo: string | null | undefined): string {
  if (!photo) {
    return "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400";
  }

  // Base64 encoded image
  if (photo.startsWith('data:')) {
    return photo;
  }

  // Google Cloud Storage direct URL
  if (photo.startsWith('https://storage.googleapis.com/')) {
    return photo;
  }

  // Object storage paths (new and legacy)
  if (photo.startsWith('/objects/') || photo.startsWith('/public-objects/')) {
    return photo;
  }

  // Legacy base64 without data prefix - assume JPEG
  return `data:image/jpeg;base64,${photo}`;
}

/**
 * Handle photo loading errors with fallback image
 */
export function handlePhotoError(event: React.SyntheticEvent<HTMLImageElement>, fallbackUrl?: string) {
  const target = event.target as HTMLImageElement;
  console.log("Image failed to load:", target.src);
  target.src = fallbackUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400";
}
