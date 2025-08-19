import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RatingDisplay } from "@/components/ui/star-rating";
import { ShoppingCart, Clock, Package, Tag, Truck, Percent } from "lucide-react";
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
    <Card className="group relative bg-white shadow-sm hover:shadow-2xl transition-all duration-500 border-0 overflow-hidden product-card-hover-elegant product-card-float" data-testid={`card-product-${product.recordid}`}>
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
          
          {/* Elegant Hover Information Preview with Layered Animation */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-600 ease-out backdrop-blur-sm">
            {/* Top Quick Actions */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200 transform translate-x-4 group-hover:translate-x-0">
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm h-8 w-8 p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Bottom Information Panel */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white info-preview-slide">
              {/* Product Quick Info */}
              <div className="space-y-2.5">
                {/* Category & Family */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-2 group-hover:translate-y-0 info-item-1">
                  <Package className="h-4 w-4 text-blue-300 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{product.famille || 'General Category'}</span>
                </div>
                
                {/* Product Reference */}
                {product.refProduit && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150 transform translate-y-2 group-hover:translate-y-0 info-item-2">
                    <Tag className="h-4 w-4 text-green-300 flex-shrink-0" />
                    <span className="text-xs text-gray-200">Ref: {product.refProduit}</span>
                  </div>
                )}
                
                {/* Stock Information */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 transform translate-y-2 group-hover:translate-y-0 info-item-3">
                  <Truck className={`h-4 w-4 flex-shrink-0 transition-colors duration-300 ${isInStock ? 'text-yellow-300' : 'text-red-300'}`} />
                  <span className="text-sm">
                    {isInStock ? 
                      (stock <= 5 ? `${t('product.lowStock')}: ${stock}` : `${stock} ${t('product.available')}`) 
                      : t('product.outOfStock')
                    }
                  </span>
                </div>
                
                {/* Promotion Details */}
                {pricing.isOnPromotion && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-250 transform translate-y-2 group-hover:translate-y-0 info-item-4">
                    <Percent className="h-4 w-4 text-red-300 flex-shrink-0 animate-pulse" />
                    <span className="text-sm font-medium text-red-200">
                      {t('product.save')} {formatCurrency(pricing.originalPrice! - pricing.currentPrice)}
                    </span>
                  </div>
                )}

                {/* Rating Preview */}
                {(product.rating || 0) > 0 && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300 transform translate-y-2 group-hover:translate-y-0 info-item-5">
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4 text-yellow-300 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-yellow-200 font-medium">{product.rating?.toFixed(1)}</span>
                      {product.ratingCount && product.ratingCount > 0 && (
                        <span className="text-xs text-gray-300">({product.ratingCount})</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Premium Action Button with Enhanced Animation */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-6 group-hover:translate-y-0 delay-150">
            <Button
              size="lg"
              className="bg-white/95 text-gray-900 hover:bg-white border-0 shadow-2xl backdrop-blur-sm px-8 py-3 font-semibold tracking-wide transform scale-90 group-hover:scale-100 transition-all duration-400 hover:shadow-3xl"
              onClick={handleAddToCart}
              disabled={!isInStock || isAdding}
            >
              <ShoppingCart className={`w-4 h-4 mr-2 transition-transform duration-300 ${isAdding ? 'animate-pulse' : 'group-hover:scale-110'}`} />
              {isAdding ? t('product.adding') : t('product.addToCart')}
            </Button>
          </div>
          
          {/* Professional Status Badges with Enhanced Animation */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 transform group-hover:scale-105 transition-all duration-400 group-hover:-translate-y-1">
            {pricing.isOnPromotion && (
              <>
                <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-3 py-1.5 shadow-lg promo-badge-pulse transform group-hover:shadow-xl transition-shadow duration-300">
                  {pricing.discountPercentage ? `-${pricing.discountPercentage}%` : 'SALE'}
                </Badge>
                {pricing.promoEndDate && (
                  <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-medium px-3 py-1.5 flex items-center gap-1.5 shadow-lg transform group-hover:shadow-xl transition-all duration-300 delay-75">
                    <Clock className="h-3 w-3 animate-pulse" />
                    {formatPromoEndDate(pricing.promoEndDate)}
                  </Badge>
                )}
              </>
            )}
            {!isInStock && (
              <Badge className="bg-gray-500 text-white text-xs font-medium px-3 py-1.5 shadow-lg transform group-hover:shadow-xl transition-shadow duration-300">
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
