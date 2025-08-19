import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RatingDisplay } from "@/components/ui/star-rating";
import { ShoppingCart, Clock } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatCurrency, getProductPricing, formatPromoEndDate } from "@/lib/utils";
import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const { t } = useTranslation();

  const handleAddToCart = async () => {
    setIsAdding(true);
    addToCart(product, 1);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const stock = product.stock || 0;
  const isInStock = stock > 0;
  const pricing = getProductPricing(product);

  return (
    <Card className="group relative bg-white shadow-sm hover:shadow-xl transition-all duration-300 border-0 overflow-hidden" data-testid={`card-product-${product.recordid}`}>
      {/* Product Image Container */}
      <Link href={`/product/${product.recordid}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {product.photo ? (
            <img
              src={product.photo.startsWith('data:') ? product.photo : `data:image/jpeg;base64,${product.photo}`}
              alt={product.produit || 'Product'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400";
              }}
              data-testid={`img-product-${product.recordid}`}
            />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400"
              alt={product.produit || 'Product'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              data-testid={`img-product-${product.recordid}`}
            />
          )}
          
          {/* Professional Overlay with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Premium Action Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Button
              size="lg"
              className="bg-white/95 text-gray-900 hover:bg-white border-0 shadow-lg backdrop-blur-sm px-8 py-3 font-medium tracking-wide"
              onClick={handleAddToCart}
              disabled={!isInStock || isAdding}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAdding ? t('product.adding') : t('product.addToCart')}
            </Button>
          </div>
          
          {/* Professional Status Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {pricing.isOnPromotion && (
              <>
                <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-3 py-1.5 shadow-md">
                  {pricing.discountPercentage ? `-${pricing.discountPercentage}%` : 'SALE'}
                </Badge>
                {pricing.promoEndDate && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-medium px-3 py-1.5 flex items-center gap-1.5 shadow-md">
                    <Clock className="h-3 w-3" />
                    {formatPromoEndDate(pricing.promoEndDate)}
                  </Badge>
                )}
              </>
            )}
            {!isInStock && (
              <Badge className="bg-gray-500 text-white text-xs font-medium px-3 py-1.5 shadow-md">
                {t('product.outOfStock')}
              </Badge>
            )}
          </div>
        </div>
      </Link>

      {/* Product Information */}
      <CardContent className="p-6 space-y-4">
        {/* Product Title */}
        <Link href={`/product/${product.recordid}`}>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight cursor-pointer hover:text-blue-600 transition-colors duration-200 line-clamp-2" data-testid={`text-product-name-${product.recordid}`}>
            {product.produit || 'Unknown Product'}
          </h3>
        </Link>
        
        {/* Product Family/Category */}
        {product.famille && (
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
            {product.famille}
          </p>
        )}
        
        {/* Rating Section */}
        <div className="flex items-center justify-between">
          <RatingDisplay 
            rating={product.rating || 0} 
            ratingCount={product.ratingCount || 0} 
            size="sm"
            showCount={true}
          />
          {stock > 0 && stock <= 5 && (
            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-xs">
              {t('product.lowStock')}: {stock}
            </Badge>
          )}
        </div>
        
        {/* Professional Pricing Section */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-900" data-testid={`text-price-${product.recordid}`}>
                {formatCurrency(pricing.currentPrice)}
              </span>
              {pricing.isOnPromotion && pricing.originalPrice && (
                <span className="text-lg text-gray-400 line-through font-medium">
                  {formatCurrency(pricing.originalPrice)}
                </span>
              )}
            </div>
            {pricing.isOnPromotion && pricing.discountPercentage && (
              <div className="text-right">
                <span className="text-sm font-medium text-red-600">
                  {t('product.save')} {formatCurrency(pricing.originalPrice! - pricing.currentPrice)}
                </span>
              </div>
            )}
          </div>
          
          {/* Stock Status */}
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${isInStock ? 'text-green-600' : 'text-red-500'}`}>
              {isInStock ? t('product.inStock') : t('product.outOfStock')}
            </span>
            {isInStock && stock <= 10 && stock > 5 && (
              <span className="text-gray-500">{stock} {t('product.available')}</span>
            )}
          </div>
        </div>
        
        {/* Action Button for Mobile */}
        <div className="pt-2 md:hidden">
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={!isInStock || isAdding}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isAdding ? t('product.adding') : t('product.addToCart')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
