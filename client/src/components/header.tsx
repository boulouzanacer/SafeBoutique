import { Link } from "wouter";
import { Search, User, ShoppingCart, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useTranslation } from 'react-i18next';
import LanguageSelector from "@/components/language-selector";
import AnimatedText from "@/components/animated-text";
import { useQuery } from "@tanstack/react-query";
import { SiteSettings } from "@shared/schema";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { openCart, getTotalItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = getTotalItems();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", "POST"),
    onSuccess: () => {
      // Clear the auth token from localStorage
      localStorage.removeItem('authToken');
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
        className: "border-blue-200 bg-blue-50 text-blue-800"
      });
      setLocation("/");
    },
    onError: (error: any) => {
      // Even if server request fails, clear local token
      localStorage.removeItem('authToken');
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
        className: "border-blue-200 bg-blue-50 text-blue-800"
      });
      setLocation("/");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header className="bg-white minimal-border sticky top-0 z-50" data-testid="header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" data-testid="link-home">
              <div className="flex-shrink-0 cursor-pointer">
                {settings?.logo ? (
                  <img 
                    src={settings.logo} 
                    alt={settings.siteName || "SafeSoft Boutique"} 
                    className="h-12 w-auto object-contain"
                    data-testid="img-logo"
                  />
                ) : (
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* Center Content - Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for products, brands, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  data-testid="input-search"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="sr-only">Clear search</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <LanguageSelector />
            {/* Account */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary" data-testid="button-account-menu">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="ml-2 hidden sm:inline">
                      {user?.firstName || user?.email || 'Account'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <AnimatedText translationKey="header.signOut" className="inline" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-600 hover:text-primary" 
                  data-testid="button-login"
                >
                  <User className="h-5 w-5" />
                  <AnimatedText translationKey="header.signIn" className="ml-2 hidden sm:inline" />
                </Button>
              </Link>
            )}
            
            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative text-gray-600 hover:text-primary"
              onClick={openCart}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-white text-[10px]"
                  data-testid="badge-cart-count"
                >
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* Admin Link - Only show for admin users */}
            {isAuthenticated && user?.isAdmin && (
              <Link href="/admin" data-testid="link-admin">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary font-light">
                  <Settings className="mr-1 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
