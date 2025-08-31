import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/components/admin/dashboard";
import Products from "@/components/admin/products";
import Orders from "@/components/admin/orders";
import Customers from "@/components/admin/customers";
import Families from "@/components/admin/families";
import API from "@/components/admin/api";
import Settings from "@/components/admin/settings";
import BulkImportExport from "@/components/admin/bulk-import-export";
import AdminAccessDenied from "@/pages/admin-access-denied";
import { useTranslation } from 'react-i18next';
import AnimatedText from "@/components/animated-text";
import LanguageTransition from "@/components/language-transition";

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  // Show loading while checking auth
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  // Redirect or show access denied if not admin
  if (!isAuthenticated || !user?.isAdmin) {
    console.log('Admin access check:', { isAuthenticated, user: user?.email, isAdmin: user?.isAdmin });
    return <AdminAccessDenied />;
  }
  return (
    <div className="min-h-screen bg-gray-100" data-testid="admin-panel">
      <LanguageTransition>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-admin-title">
              <AnimatedText translationKey="admin.title" />
            </h1>
            <Link href="/">
              <Button variant="ghost" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <AnimatedText translationKey="admin.backToStore" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8" data-testid="admin-tabs">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard">
              <AnimatedText translationKey="admin.dashboard" />
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              <AnimatedText translationKey="admin.products" />
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <AnimatedText translationKey="admin.orders" />
            </TabsTrigger>
            <TabsTrigger value="customers" data-testid="tab-customers">
              <AnimatedText translationKey="admin.customers" />
            </TabsTrigger>
            <TabsTrigger value="families" data-testid="tab-families">
              <AnimatedText translationKey="admin.families" />
            </TabsTrigger>
            <TabsTrigger value="bulk" data-testid="tab-bulk">
              <AnimatedText translationKey="admin.importExport" />
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <AnimatedText translationKey="admin.settings" />
            </TabsTrigger>
            <TabsTrigger value="api" data-testid="tab-api">
              <AnimatedText translationKey="admin.api" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="products">
            <Products />
          </TabsContent>

          <TabsContent value="orders">
            <Orders />
          </TabsContent>

          <TabsContent value="customers">
            <Customers />
          </TabsContent>

          <TabsContent value="families">
            <Families />
          </TabsContent>

          <TabsContent value="bulk">
            <BulkImportExport />
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>

          <TabsContent value="api">
            <API />
          </TabsContent>
        </Tabs>
      </div>
      </LanguageTransition>
    </div>
  );
}
