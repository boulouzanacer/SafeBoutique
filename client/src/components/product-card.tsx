import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { Link } from "wouter";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    addToCart(product, 1);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  const price = product.pv1Ht || 0;
  const stock = product.stock || 0;
  const isInStock = stock > 0;
  const isOnSale = product.promo === 1;

  return (
    <div className="group product-card-hover elegant-shadow bg-white overflow-hidden" data-testid={`card-product-${product.recordid}`}>
      {/* Product Image */}
      <Link href={`/product/${product.recordid}`}>
        <div className="aspect-square relative overflow-hidden bg-gray-50 cursor-pointer">
        {product.photo ? (
          <img
            src={product.photo.startsWith('data:') ? product.photo : `data:image/jpeg;base64,${product.photo}`}
            alt={product.produit || 'Product'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400";
            }}
            data-testid={`img-product-${product.recordid}`}
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
            alt={product.produit || 'Product'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            data-testid={`img-product-${product.recordid}`}
          />
        )}
        
        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white text-black hover:bg-gray-100 font-light tracking-wide"
            onClick={handleAddToCart}
            disabled={!isInStock || isAdding}
          >
            {isAdding ? 'Added ✓' : 'Quick Add'}
          </Button>
        </div>
        
        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary text-white text-xs font-light px-2 py-1">
              Special Offer
            </Badge>
          </div>
        )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-6 text-center">
        <Link href={`/product/${product.recordid}`}>
          <h3 className="font-light text-gray-900 mb-2 text-lg tracking-wide cursor-pointer hover:text-primary transition-colors" data-testid={`text-product-name-${product.recordid}`}>
            {product.produit || 'Unknown Product'}
          </h3>
        </Link>
        
        <div className="border-t border-gray-100 my-3"></div>
        
        <div className="mb-4">
          <span className="text-lg font-light text-gray-900 tracking-wide" data-testid={`text-price-${product.recordid}`}>
            {formatCurrency(price)}
          </span>
          {!isInStock && (
            <p className="text-sm text-red-500 mt-1 font-light">Out of Stock</p>
          )}
        </div>
      </div>
    </div>
  );
}
