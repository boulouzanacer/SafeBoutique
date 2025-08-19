import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ProductCard from "@/components/product-card";
import CartSidebar from "@/components/cart-sidebar";
import ImageSlider from "@/components/image-slider";
import Footer from "@/components/footer";
import { ProductGridSkeleton } from "@/components/skeletons/product-grid-skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Filter, Search } from "lucide-react";
import { Product } from "@shared/schema";

export default function Home() {
  const [filters, setFilters] = useState({
    famille: "",
    search: "",
    inStock: false,
    promo: false
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== false) {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    }
  });

  // Fetch families for filter sidebar
  const { data: families = [] } = useQuery<string[]>({
    queryKey: ["/api/families"],
  });

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onSearch={handleSearch} />

      {/* Dynamic Image Slider */}
      <ImageSlider />

      {/* Product Showcase */}
      <section id="products" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light tracking-wide text-gray-900 mb-4" data-testid="text-products-title">
            Our Products
          </h2>
          <div className="w-20 h-px bg-gray-300 mx-auto mb-6"></div>
          <p className="text-gray-600 font-light max-w-2xl mx-auto" data-testid="text-products-subtitle">
            Discover our carefully curated collection of premium products designed for professionals.
          </p>
        </div>

        {/* Advanced Filters */}
        <div className="mb-12 space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 items-center justify-center bg-gray-50 p-4 rounded-lg">
            {/* Family Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select 
                value={filters.famille || "all"} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, famille: value === "all" ? "" : value }))}
              >
                <SelectTrigger className="w-[180px]" data-testid="select-family">
                  <SelectValue placeholder="Filter by Family" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Families</SelectItem>
                  {families.map((family) => (
                    <SelectItem key={family} value={family}>
                      {family}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-2">
              <Button
                variant={filters.inStock ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, inStock: !prev.inStock }))}
                data-testid="filter-in-stock"
                className="font-light tracking-wide"
              >
                In Stock Only
              </Button>
              
              <Button
                variant={filters.promo ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, promo: !prev.promo }))}
                data-testid="filter-promotions"
                className="font-light tracking-wide"
              >
                On Promotion
              </Button>
            </div>

            {/* Clear Filters */}
            {(filters.famille || filters.inStock || filters.promo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ famille: "", search: "", inStock: false, promo: false })}
                data-testid="clear-filters"
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filter Tags */}
          {(filters.famille || filters.inStock || filters.promo || filters.search) && (
            <div className="flex flex-wrap gap-2 justify-center">
              {filters.famille && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Family: {filters.famille}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, famille: "" }))}
                  />
                </Badge>
              )}
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.search}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                  />
                </Badge>
              )}
              {filters.inStock && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  In Stock Only
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, inStock: false }))}
                  />
                </Badge>
              )}
              {filters.promo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  On Promotion
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setFilters(prev => ({ ...prev, promo: false }))}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <Button
              variant={filters.famille === "" ? "default" : "outline"}
              size="sm"
              className="font-light tracking-wide border-gray-300 hover:border-primary"
              onClick={() => setFilters(prev => ({ ...prev, famille: "" }))}
              data-testid="filter-all"
            >
              All
            </Button>
            {families.map((family) => (
              <Button
                key={family}
                variant={filters.famille === family ? "default" : "outline"}
                size="sm"
                className="font-light tracking-wide border-gray-300 hover:border-primary"
                onClick={() => setFilters(prev => ({ ...prev, famille: family }))}
                data-testid={`filter-${family}`}
              >
                {family}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
            data-testid="products-container"
          >
            {products.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500" data-testid="text-no-products">
                <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="font-light text-xl mb-2">No products found</p>
                {filters.search ? (
                  <div className="text-sm space-y-2">
                    <p>No results for "<strong>{filters.search}</strong>"</p>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>• Try searching for product names, brands, or categories</p>
                      <p>• Check your spelling or try different keywords</p>
                      <p>• Use more general terms (e.g., "LCD" instead of "LCD Nokia")</p>
                      {(filters.famille || filters.inStock || filters.promo) && (
                        <p>• Remove filters to see more results</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm space-y-2">
                    <p>No products match your current filters</p>
                    <div className="text-xs text-gray-400">
                      <p>Try removing some filters or browsing all products</p>
                    </div>
                  </div>
                )}
                {(filters.famille || filters.inStock || filters.promo || filters.search) && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 font-light"
                    onClick={() => setFilters({ famille: "", search: "", inStock: false, promo: false })}
                    data-testid="button-clear-all-filters"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              products.map((product) => (
                <ProductCard key={product.recordid} product={product} />
              ))
            )}
          </div>
        )}
      </section>

      <Footer />

      <CartSidebar />
    </div>
  );
}
