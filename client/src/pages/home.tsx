import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import ProductCard from "@/components/product-card";
import CartSidebar from "@/components/cart-sidebar";
import ImageSlider from "@/components/image-slider";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Product } from "@shared/schema";

export default function Home() {
  const [filters, setFilters] = useState({
    famille: "",
    search: ""
  });

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

        {/* Category Filter Pills */}
        <div className="flex justify-center mb-12">
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
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" data-testid="loading-products" />
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            data-testid="products-container"
          >
            {products.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500" data-testid="text-no-products">
                <p className="font-light text-lg mb-2">No products found</p>
                <p className="text-sm">Try adjusting your category filter</p>
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
