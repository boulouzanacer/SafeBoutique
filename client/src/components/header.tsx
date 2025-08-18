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
                <h1 className="text-3xl font-light tracking-wide text-primary">SafeSoft</h1>
                <p className="text-sm text-gray-400 font-light tracking-widest uppercase">Boutique</p>
              </div>
            </Link>
          </div>

          {/* Center Content - Search */}
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 border-0 border-b border-gray-200 rounded-none bg-transparent focus:border-primary focus:ring-0 px-0 font-light"
                  data-testid="input-search"
                />
                <Search className="absolute right-0 top-3 h-4 w-4 text-gray-400" />
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
