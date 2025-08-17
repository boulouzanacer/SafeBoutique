import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatCurrency, getProductPricing } from "@/lib/utils";
import { Link } from "wouter";

export default function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
  } = useCart();

  const total = getTotalPrice();
  const delivery = 9.99;
  const finalTotal = total + delivery;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeCart}
        data-testid="cart-backdrop"
      />

      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl" data-testid="cart-sidebar">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" data-testid="text-cart-title">Shopping Cart</h2>
              <Button variant="ghost" size="sm" onClick={closeCart} data-testid="button-close-cart">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Items */}
          <ScrollArea className="flex-1 p-6">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-8" data-testid="text-cart-empty">
                Your cart is empty
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.product.recordid}
                    className="flex items-center space-x-4"
                    data-testid={`cart-item-${item.product.recordid}`}
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {item.product.photo ? (
                        <img
                          src={item.product.photo.startsWith('data:') ? item.product.photo : `data:image/jpeg;base64,${item.product.photo}`}
                          alt={item.product.produit || 'Product'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80";
                          }}
                          data-testid={`img-cart-${item.product.recordid}`}
                        />
                      ) : (
                        <img
                          src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
                          alt={item.product.produit || 'Product'}
                          className="w-full h-full object-cover"
                          data-testid={`img-cart-${item.product.recordid}`}
                        />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900" data-testid={`text-cart-name-${item.product.recordid}`}>
                        {item.product.produit}
                      </h3>
                      <p className="text-sm text-gray-500" data-testid={`text-cart-ref-${item.product.recordid}`}>
                        {item.product.refProduit}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.recordid, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          data-testid={`button-decrease-${item.product.recordid}`}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Badge variant="outline" data-testid={`text-quantity-${item.product.recordid}`}>
                          {item.quantity}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.recordid, item.quantity + 1)}
                          data-testid={`button-increase-${item.product.recordid}`}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="text-right">
                      {(() => {
                        const pricing = getProductPricing(item.product);
                        return (
                          <div>
                            <p className="font-medium text-gray-900" data-testid={`text-cart-price-${item.product.recordid}`}>
                              {formatCurrency(pricing.currentPrice * item.quantity)}
                            </p>
                            {pricing.isOnPromotion && pricing.originalPrice && (
                              <p className="text-xs text-gray-500 line-through">
                                {formatCurrency(pricing.originalPrice * item.quantity)}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 mt-1"
                        onClick={() => removeFromCart(item.product.recordid)}
                        data-testid={`button-remove-${item.product.recordid}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span data-testid="text-subtotal">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery:</span>
                  <span data-testid="text-delivery">{formatCurrency(delivery)}</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span>Total:</span>
                  <span data-testid="text-total">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
              
              <Link href="/checkout" onClick={closeCart}>
                <Button className="w-full bg-primary hover:bg-blue-600" data-testid="button-checkout">
                  Proceed to Checkout (COD)
                </Button>
              </Link>
              
              <p className="text-sm text-gray-500 text-center mt-2">
                Cash on Delivery Available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
