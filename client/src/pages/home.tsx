import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ProductCard from "@/components/product-card";
import CartSidebar from "@/components/cart-sidebar";
import ImageSlider from "@/components/image-slider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Grid3X3, List, Loader2 } from "lucide-react";
import { Product } from "@shared/schema";

export default function Home() {
  const [filters, setFilters] = useState({
    famille: "",
    search: "",
    minPrice: 0,
    maxPrice: 1000,
    inStock: false,
    promo: false,
    sortBy: "featured"
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== false && value !== 0) {
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

  const handleFamilyChange = (famille: string, checked: boolean) => {
    if (checked) {
      setFilters(prev => ({ ...prev, famille }));
    } else {
      setFilters(prev => ({ ...prev, famille: "" }));
    }
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      minPrice: value[0],
      maxPrice: value[1]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />

      {/* Dynamic Image Slider */}
      <ImageSlider />

      {/* Product Catalog */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0" data-testid="filter-sidebar">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4" data-testid="text-filters-title">Filters</h3>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3" data-testid="text-categories-title">Categories</h4>
                  <div className="space-y-2">
                    {families.map((family) => (
                      <div key={family} className="flex items-center space-x-2">
                        <Checkbox
                          id={family}
                          checked={filters.famille === family}
                          onCheckedChange={(checked) => handleFamilyChange(family, checked as boolean)}
                          data-testid={`checkbox-family-${family}`}
                        />
                        <Label htmlFor={family} className="text-sm font-normal cursor-pointer">
                          {family}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3" data-testid="text-price-range-title">Price Range</h4>
                  <div className="space-y-2">
                    <Slider
                      value={[filters.minPrice, filters.maxPrice]}
                      onValueChange={handlePriceRangeChange}
                      max={1000}
                      step={10}
                      className="w-full"
                      data-testid="slider-price-range"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span data-testid="text-min-price">${filters.minPrice}</span>
                      <span data-testid="text-max-price">${filters.maxPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3" data-testid="text-availability-title">Availability</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="inStock"
                        checked={filters.inStock}
                        onCheckedChange={(checked) =>
                          setFilters(prev => ({ ...prev, inStock: checked as boolean }))
                        }
                        data-testid="checkbox-in-stock"
                      />
                      <Label htmlFor="inStock" className="text-sm font-normal cursor-pointer">
                        In Stock
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="promo"
                        checked={filters.promo}
                        onCheckedChange={(checked) =>
                          setFilters(prev => ({ ...prev, promo: checked as boolean }))
                        }
                        data-testid="checkbox-on-sale"
                      />
                      <Label htmlFor="promo" className="text-sm font-normal cursor-pointer">
                        On Sale
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Search and Sort Bar */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center">
                    <span className="text-gray-600" data-testid="text-products-count">
                      Showing {products.length} products
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                    >
                      <SelectTrigger className="w-48" data-testid="select-sort">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured" data-testid="sort-featured">Sort by: Featured</SelectItem>
                        <SelectItem value="price-low" data-testid="sort-price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high" data-testid="sort-price-high">Price: High to Low</SelectItem>
                        <SelectItem value="newest" data-testid="sort-newest">Newest First</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex border border-gray-300 rounded-md">
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        className="border-r-0 rounded-r-none"
                        onClick={() => setViewMode("grid")}
                        data-testid="button-grid-view"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        className="rounded-l-none"
                        onClick={() => setViewMode("list")}
                        data-testid="button-list-view"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid/List */}
            {productsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" data-testid="loading-products" />
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
                data-testid="products-container"
              >
                {products.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500" data-testid="text-no-products">
                    No products found matching your filters.
                  </div>
                ) : (
                  products.map((product) => (
                    <ProductCard key={product.recordid} product={product} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4" data-testid="text-footer-title">SafeSoft Boutique</h3>
              <p className="text-gray-300" data-testid="text-footer-description">
                Premium products for professionals with reliable delivery and excellent customer service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" data-testid="text-quick-links">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#products" className="hover:text-white" data-testid="link-products">Products</a></li>
                <li><a href="#categories" className="hover:text-white" data-testid="link-categories">Categories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" data-testid="text-customer-service">Customer Service</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white" data-testid="link-help">Help Center</a></li>
                <li><a href="#" className="hover:text-white" data-testid="link-shipping">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white" data-testid="link-returns">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" data-testid="text-contact-info">Contact Info</h4>
              <div className="space-y-2 text-gray-300">
                <p data-testid="text-phone">📞 +1 (555) 123-4567</p>
                <p data-testid="text-email">✉️ support@safesoft.com</p>
                <p data-testid="text-address">📍 123 Business Ave, City, State</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p data-testid="text-copyright">&copy; 2024 SafeSoft Boutique. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <CartSidebar />
    </div>
  );
}
