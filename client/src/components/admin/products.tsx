import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminTableSkeleton } from "@/components/skeletons/admin-table-skeleton";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import AnimatedText from "@/components/animated-text";
import LanguageTransition from "@/components/language-transition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, Filter, X, Search } from "lucide-react";
import { Product, InsertProduct } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, getProductPricing } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function Products() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({
    famille: "",
    search: "",
    inStock: false,
    promo: false
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      codeBarre: "",
      cbColis: "",
      refProduit: "",
      produit: "",
      paHt: 0,
      tva: 0,
      pampHt: 0,
      pv1Ht: 0,
      pv2Ht: 0,
      pv3Ht: 0,
      pv4Ht: 0,
      pv5Ht: 0,
      pv6Ht: 0,
      pvLimite: 0,
      ppa: 0,
      stock: 0,
      colissage: 0,
      stockIni: 0,
      prixIni: 0,
      blocage: 0,
      gerPoids: 0,
      sup: 0,
      famille: "",
      sousFamille: "",
      photo: "",
      detaille: "",
      codeFrs: "",
      promo: 0,
      pp1Ht: 0,
      qtePromo: 0,
      fid: 0,
      marque: "",
      um: "",
      poids: 0,
      utilisateur: ""
    }
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
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

  // Fetch families for filter dropdown
  const { data: families = [] } = useQuery<string[]>({
    queryKey: ["/api/families"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      form.reset();
      setEditingProduct(null);
      toast({
        title: "Success",
        description: "Product created successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive"
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProduct> }) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      form.reset();
      setEditingProduct(null);
      toast({
        title: "Success",
        description: "Product updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive"
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: InsertProduct) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.recordid, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      codeBarre: product.codeBarre,
      cbColis: product.cbColis || "",
      refProduit: product.refProduit,
      produit: product.produit || "",
      paHt: product.paHt || 0,
      tva: product.tva || 0,
      pampHt: product.pampHt || 0,
      pv1Ht: product.pv1Ht || 0,
      pv2Ht: product.pv2Ht || 0,
      pv3Ht: product.pv3Ht || 0,
      pv4Ht: product.pv4Ht || 0,
      pv5Ht: product.pv5Ht || 0,
      pv6Ht: product.pv6Ht || 0,
      pvLimite: product.pvLimite || 0,
      ppa: product.ppa || 0,
      stock: product.stock || 0,
      colissage: product.colissage || 0,
      stockIni: product.stockIni || 0,
      prixIni: product.prixIni || 0,
      blocage: product.blocage || 0,
      gerPoids: product.gerPoids || 0,
      sup: product.sup || 0,
      famille: product.famille || "",
      sousFamille: product.sousFamille || "",
      photo: product.photo || "",
      detaille: product.detaille || "",
      codeFrs: product.codeFrs || "",
      promo: product.promo || 0,
      pp1Ht: product.pp1Ht || 0,
      qtePromo: product.qtePromo || 0,
      fid: product.fid || 0,
      marque: product.marque || "",
      um: product.um || "",
      poids: product.poids || 0,
      utilisateur: product.utilisateur || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    form.reset();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <AdminTableSkeleton rows={8} columns={8} hasActions={true} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle data-testid="text-products-title">
                <AnimatedText translationKey="products.title" />
              </CardTitle>
              
              {/* Advanced Filters */}
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  {/* Search */}
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-500" />
                    <Input
                      placeholder={t("products.search")}
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-64"
                      data-testid="input-search-products"
                    />
                  </div>
                  
                  {/* Family Filter */}
                  <Select 
                    value={filters.famille || "all"} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, famille: value === "all" ? "" : value }))}
                  >
                    <SelectTrigger className="w-[180px]" data-testid="select-family-filter">
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

                  {/* Status Filters */}
                  <Button
                    variant={filters.inStock ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, inStock: !prev.inStock }))}
                    data-testid="filter-in-stock-admin"
                  >
                    In Stock Only
                  </Button>
                  
                  <Button
                    variant={filters.promo ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, promo: !prev.promo }))}
                    data-testid="filter-promotions-admin"
                  >
                    On Promotion
                  </Button>

                  {/* Clear Filters */}
                  {(filters.famille || filters.search || filters.inStock || filters.promo) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilters({ famille: "", search: "", inStock: false, promo: false })}
                      data-testid="clear-filters-admin"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Active Filter Tags */}
                {(filters.famille || filters.search || filters.inStock || filters.promo) && (
                  <div className="flex flex-wrap gap-2">
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
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewProduct} data-testid="button-add-product">
                  <Plus className="mr-2 h-4 w-4" />
                  <AnimatedText translationKey="products.add" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                <DialogHeader>
                  <DialogTitle data-testid="text-product-dialog-title">
                    <AnimatedText translationKey={editingProduct ? "products.edit" : "products.add"} />
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct 
                      ? "Update product information, pricing, and inventory details"
                      : "Create a new product by filling in the required information below"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="codeBarre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Barcode *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-barcode" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="refProduit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Reference *</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-ref-produit" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="produit"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} data-testid="input-product-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pv1Ht"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (PV1)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value || ""}
                                type="number" 
                                step="0.01"
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-price"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value || ""}
                                type="number"
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-stock"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="famille"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Family</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} data-testid="input-family" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sousFamille"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sub-family</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} data-testid="input-sub-family" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="marque"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ""} data-testid="input-brand" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="promo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Promotion Status</FormLabel>
                            <FormControl>
                              <Select 
                                value={field.value?.toString() || "0"} 
                                onValueChange={(value) => field.onChange(parseInt(value))}
                              >
                                <SelectTrigger data-testid="select-promo">
                                  <SelectValue placeholder="Select promotion status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">No Promotion</SelectItem>
                                  <SelectItem value="1">On Sale</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Promotional Fields - Always show promotional price */}
                      <FormField
                        control={form.control}
                        name="pp1Ht"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Promotional Price (DA) - Set to 0 for no promotion</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                value={field.value || ""}
                                type="number" 
                                step="0.01"
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-promo-price"
                                placeholder="0 = No promotion"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Additional promotional fields - Only show when pp1Ht > 0 */}
                      {(form.watch("pp1Ht") || 0) > 0 && (
                        <>
                          <FormField
                            control={form.control}
                            name="qtePromo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Promotional Quantity (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    value={field.value || ""}
                                    type="number"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    data-testid="input-promo-quantity"
                                    placeholder="Leave empty for unlimited"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="d1"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Promotion Start Date (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                                    type="datetime-local"
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                    data-testid="input-promo-start"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="d2"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Promotion End Date (Optional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                                    type="datetime-local"
                                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                    data-testid="input-promo-end"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                      
                      <FormField
                        control={form.control}
                        name="detaille"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} value={field.value || ""} rows={3} data-testid="textarea-description" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        data-testid="button-cancel"
                      >
<AnimatedText translationKey="common.cancel" />
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createProductMutation.isPending || updateProductMutation.isPending}
                        data-testid="button-save"
                      >
{createProductMutation.isPending || updateProductMutation.isPending 
                          ? <AnimatedText translationKey="common.saving" />
                          : editingProduct ? <AnimatedText translationKey="common.update" /> : <AnimatedText translationKey="common.create" />}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead><AnimatedText translationKey="products.barcode" /></TableHead>
                  <TableHead><AnimatedText translationKey="products.reference" /></TableHead>
                  <TableHead><AnimatedText translationKey="products.name" /></TableHead>
                  <TableHead><AnimatedText translationKey="products.price" /></TableHead>
                  <TableHead><AnimatedText translationKey="products.stock" /></TableHead>
                  <TableHead><AnimatedText translationKey="products.family" /></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><AnimatedText translationKey="products.promotion" /></TableHead>
                  <TableHead><AnimatedText translationKey="products.actions" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500" data-testid="text-no-products">
                      {t("products.noResults", "No products found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.recordid} data-testid={`row-product-${product.recordid}`}>
                      <TableCell data-testid={`text-id-${product.recordid}`}>
                        {product.recordid}
                      </TableCell>
                      <TableCell data-testid={`text-barcode-${product.recordid}`}>
                        {product.codeBarre}
                      </TableCell>
                      <TableCell data-testid={`text-ref-${product.recordid}`}>
                        {product.refProduit}
                      </TableCell>
                      <TableCell data-testid={`text-name-${product.recordid}`}>
                        {product.produit || 'N/A'}
                      </TableCell>
                      <TableCell data-testid={`text-price-${product.recordid}`}>
                        <div className="space-y-1">
                          {(() => {
                            const pricing = getProductPricing(product);
                            return (
                              <div>
                                <div className="font-medium">
                                  {formatCurrency(pricing.currentPrice)}
                                </div>
                                {pricing.isOnPromotion && pricing.originalPrice && (
                                  <div className="text-xs text-gray-500 line-through">
                                    {formatCurrency(pricing.originalPrice)}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-stock-${product.recordid}`}>
                        {product.stock || 0}
                      </TableCell>
                      <TableCell data-testid={`text-family-${product.recordid}`}>
                        {product.famille || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge 
                            variant={(product.stock || 0) > 0 ? "default" : "destructive"}
                            className={(product.stock || 0) > 0 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                            data-testid={`badge-stock-${product.recordid}`}
                          >
{(product.stock || 0) > 0 ? t("products.inStock") : t("common.outOfStock")}
                          </Badge>
                          {(product.pp1Ht && product.pp1Ht > 0) && (
                            <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
{t("common.sale")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`cell-promotion-${product.recordid}`}>
                        {(() => {
                          const pricing = getProductPricing(product);
                          if (!pricing.isOnPromotion) {
return <span className="text-gray-400">{t("products.noPromotion", "No promotion")}</span>;
                          }
                          
                          return (
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <Badge variant="destructive" className="text-xs">
                                  -{pricing.discountPercentage}%
                                </Badge>
                              </div>
                              {product.d1 && (
                                <div className="text-gray-600">
                                  Start: {new Date(product.d1).toLocaleDateString()}
                                </div>
                              )}
                              {product.d2 && (
                                <div className="text-gray-600">
                                  End: {new Date(product.d2).toLocaleDateString()}
                                </div>
                              )}
                              {product.qtePromo && product.qtePromo > 0 && (
                                <div className="text-blue-600">
                                  Qty: {product.qtePromo} left
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            data-testid={`button-edit-${product.recordid}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.recordid)}
                            className="text-red-500 hover:text-red-700"
                            data-testid={`button-delete-${product.recordid}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}