import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CartSidebar from "@/components/cart-sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Minus, 
  Plus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Clock,
  Tag,
  Send
} from "lucide-react";
import { StarRating, RatingDisplay } from "@/components/ui/star-rating";
import ReviewForm from "@/components/ui/review-form";
import ReviewsList from "@/components/ui/reviews-list";
import { Product } from "@shared/schema";
import { formatCurrency, getProductPricing, formatPromoEndDate } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id ? parseInt(params.id) : null;
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Fetch product details
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      if (!productId) throw new Error("No product ID provided");
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Product not found");
      return response.json();
    },
    enabled: !!productId
  });

  // Fetch related products
  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", "related", product?.famille],
    queryFn: async () => {
      if (!product?.famille) return [];
      const response = await fetch(`/api/products?famille=${product.famille}&limit=4`);
      if (!response.ok) return [];
      const products = await response.json();
      // Filter out current product
      return products.filter((p: Product) => p.recordid !== productId);
    },
    enabled: !!product?.famille
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product, quantity);

    toast({
      title: "Added to Cart",
      description: `${quantity} item(s) added successfully`,
      className: "border-green-200 bg-green-50 text-green-800"
    });
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(quantity + delta, product?.stock || 999));
    setQuantity(newQuantity);
  };

  const productImages = product?.photo ? [product.photo] : [];
  const currentImage = productImages[selectedImageIndex] || "";
  const pricing = product ? getProductPricing(product) : { currentPrice: 0, isOnPromotion: false };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header onSearch={() => {}} />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-gray-200 aspect-square rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header onSearch={() => {}} />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onSearch={() => {}} />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <span className="text-gray-700">{product.produit}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage.startsWith('data:') ? currentImage : `data:image/jpeg;base64,${currentImage}`}
                  alt={product.produit || "Product"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800";
                  }}
                />
              ) : (
                <img
                  src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                  alt={product.produit || "Product"}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Image Navigation */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                    disabled={selectedImageIndex === 0}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(Math.min(productImages.length - 1, selectedImageIndex + 1))}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                    disabled={selectedImageIndex === productImages.length - 1}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex space-x-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`}
                      alt={`${product.produit} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=160&h=160";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Title & Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="product-title">
                {product.produit || "Product Name"}
              </h1>
              
              <div className="flex items-center gap-2 mb-4">
                {product.famille && (
                  <Badge variant="secondary">
                    {product.famille}
                  </Badge>
                )}
                {pricing.isOnPromotion && (
                  <Badge className="bg-red-600 text-white">
                    <Tag className="h-3 w-3 mr-1" />
                    {pricing.discountPercentage ? `-${pricing.discountPercentage}%` : 'PROMO'}
                  </Badge>
                )}
              </div>

              <div className="flex items-baseline space-x-4 mb-4">
                <span className="text-3xl font-bold text-gray-900" data-testid="product-price">
                  {formatCurrency(pricing.currentPrice)}
                </span>
                {pricing.isOnPromotion && pricing.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatCurrency(pricing.originalPrice)}
                  </span>
                )}
              </div>

              {/* Rating Display */}
              <div className="mb-4">
                <RatingDisplay 
                  rating={product.rating || 0} 
                  ratingCount={product.ratingCount || 0} 
                  size="md"
                  showCount={true}
                />
              </div>

              {/* Promotion Timer */}
              {pricing.isOnPromotion && pricing.promoEndDate && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-orange-700">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">
                      Promotion ends: {formatPromoEndDate(pricing.promoEndDate)}
                    </span>
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="flex items-center space-x-2 mb-6">
                {(product.stock || 0) > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">In Stock ({product.stock} available)</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600">Out of Stock</span>
                  </>
                )}
              </div>
            </div>

            {/* Product Description */}
            {product.detaille && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.detaille}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-center min-w-[60px]">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity >= (product.stock || 999)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={(product.stock || 0) <= 0}
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={isWishlisted ? "text-red-600 border-red-600" : ""}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                
                <Button variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Product Features */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <Truck className="h-5 w-5 text-gray-400" />
                <span>Free delivery on orders over 5000 DA</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Shield className="h-5 w-5 text-gray-400" />
                <span>Secure payment</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <RotateCcw className="h-5 w-5 text-gray-400" />
                <span>30-day return policy</span>
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">SKU:</span>
                  <span className="ml-2 font-medium">{product.codeBarre || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-2 font-medium">{product.famille || 'N/A'}</span>
                </div>
                {product.poids && (
                  <div>
                    <span className="text-gray-500">Weight:</span>
                    <span className="ml-2 font-medium">{product.poids}g</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-600 leading-relaxed">
                      {product.detaille || "No detailed description available for this product."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Product Code:</span>
                        <span className="font-medium">{product.codeBarre || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{product.famille || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Stock:</span>
                        <span className="font-medium">{product.stock || 0} units</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {product.poids && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Weight:</span>
                          <span className="font-medium">{product.poids}g</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price (excl. tax):</span>
                        <span className="font-medium">{formatCurrency(product.paHt || 0)}</span>
                      </div>
                      {pricing.isOnPromotion && product.pp1Ht && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Promo Price:</span>
                          <span className="font-medium text-red-600">{formatCurrency(product.pp1Ht)}</span>
                        </div>
                      )}
                      {product.tva && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">VAT:</span>
                          <span className="font-medium">{product.tva}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Rating Summary */}
                    <div className="border-b pb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Customer Reviews</h3>
                        <div className="text-right">
                          <RatingDisplay 
                            rating={product.rating || 0} 
                            ratingCount={product.ratingCount || 0} 
                            size="lg"
                            showCount={true}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Add Review Form */}
                    <div className="border-b pb-6">
                      <h4 className="text-md font-semibold mb-4">Write a Review</h4>
                      <ReviewForm productId={product.recordid} onReviewSubmitted={() => {
                        // Refresh product data to get updated rating
                        window.location.reload();
                      }} />
                    </div>

                    {/* Reviews List */}
                    <ReviewsList productId={product.recordid} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <Link
                  key={relatedProduct.recordid}
                  href={`/product/${relatedProduct.recordid}`}
                  className="group"
                >
                  <Card className="group-hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                        {relatedProduct.photo ? (
                          <img
                            src={relatedProduct.photo.startsWith('data:') ? relatedProduct.photo : `data:image/jpeg;base64,${relatedProduct.photo}`}
                            alt={relatedProduct.produit || "Product"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400";
                            }}
                          />
                        ) : (
                          <img
                            src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
                            alt={relatedProduct.produit || "Product"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {relatedProduct.produit || "Product Name"}
                        </h3>
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(relatedProduct.pv1Ht || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
      <CartSidebar />
    </div>
  );
}