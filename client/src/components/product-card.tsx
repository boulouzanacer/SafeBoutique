import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useState } from "react";

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
    <Card className="overflow-hidden hover:shadow-md transition-shadow" data-testid={`card-product-${product.recordid}`}>
      {/* Product Image */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {product.photo ? (
          <img
            src={product.photo.startsWith('data:') ? product.photo : `data:image/jpeg;base64,${product.photo}`}
            alt={product.produit || 'Product'}
            className="w-full h-full object-cover"
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
            className="w-full h-full object-cover"
            data-testid={`img-product-${product.recordid}`}
          />
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs" data-testid={`badge-family-${product.recordid}`}>
            {product.famille || 'Uncategorized'}
          </Badge>
          <Badge
            variant={isInStock ? "default" : "destructive"}
            className={`text-xs ${isInStock ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}`}
            data-testid={`badge-stock-${product.recordid}`}
          >
            {isInStock ? 'In Stock' : 'Out of Stock'}
          </Badge>
          {isOnSale && (
            <Badge variant="destructive" className="text-xs bg-red-100 text-red-800 hover:bg-red-100">
              Sale
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2" data-testid={`text-product-name-${product.recordid}`}>
          {product.produit || 'Unknown Product'}
        </h3>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2" data-testid={`text-product-description-${product.recordid}`}>
          {product.detaille || 'No description available'}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900" data-testid={`text-price-${product.recordid}`}>
              ${price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 ml-2" data-testid={`text-ref-${product.recordid}`}>
              {product.refProduit}
            </span>
          </div>

          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!isInStock || isAdding}
            className={`transition-colors ${
              isAdding
                ? 'bg-green-600 hover:bg-green-600'
                : 'bg-primary hover:bg-blue-600'
            }`}
            data-testid={`button-add-cart-${product.recordid}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {isAdding && <span className="ml-1">✓</span>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
