import { Link } from "wouter";
import { Search, User, ShoppingCart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { useState } from "react";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { openCart, getTotalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = getTotalItems();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" data-testid="link-home">
              <div className="flex-shrink-0 cursor-pointer">
                <h1 className="text-2xl font-bold text-primary">SafeSoft</h1>
                <p className="text-xs text-gray-500">Boutique</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" data-testid="link-home-nav">
              <a className="text-gray-700 hover:text-primary transition-colors">Home</a>
            </Link>
            <a href="#products" className="text-gray-700 hover:text-primary transition-colors">Products</a>
            <a href="#categories" className="text-gray-700 hover:text-primary transition-colors">Categories</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                  data-testid="input-search"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </form>
            
            {/* Account */}
            <Button variant="ghost" size="sm" data-testid="button-account">
              <User className="h-5 w-5" />
            </Button>
            
            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={openCart}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent hover:bg-accent"
                  data-testid="badge-cart-count"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Admin Link */}
            <Link href="/admin" data-testid="link-admin">
              <Button className="bg-primary text-white hover:bg-blue-600 transition-colors">
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
