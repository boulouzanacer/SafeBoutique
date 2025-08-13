import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Product, InsertProduct } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    queryKey: ["/api/products"],
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product",
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product",
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product",
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
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle data-testid="text-products-title">Product Management</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleNewProduct} data-testid="button-add-product">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                <DialogHeader>
                  <DialogTitle data-testid="text-product-dialog-title">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
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
                              <Input {...field} data-testid="input-product-name" />
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
                              <Input {...field} data-testid="input-family" />
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
                              <Input {...field} data-testid="input-sub-family" />
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
                              <Input {...field} data-testid="input-brand" />
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
                            <FormLabel>Promotion</FormLabel>
                            <FormControl>
                              <Select 
                                value={field.value?.toString()} 
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
                      
                      <FormField
                        control={form.control}
                        name="detaille"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} data-testid="textarea-description" />
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
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createProductMutation.isPending || updateProductMutation.isPending}
                        data-testid="button-save"
                      >
                        {createProductMutation.isPending || updateProductMutation.isPending 
                          ? "Saving..." 
                          : editingProduct ? "Update" : "Create"}
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
                  <TableHead>Barcode</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Family</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.recordid} data-testid={`row-product-${product.recordid}`}>
                    <TableCell data-testid={`text-id-${product.recordid}`}>{product.recordid}</TableCell>
                    <TableCell data-testid={`text-barcode-${product.recordid}`}>{product.codeBarre}</TableCell>
                    <TableCell data-testid={`text-ref-${product.recordid}`}>{product.refProduit}</TableCell>
                    <TableCell data-testid={`text-name-${product.recordid}`}>{product.produit}</TableCell>
                    <TableCell data-testid={`text-price-${product.recordid}`}>
                      ${(product.pv1Ht || 0).toFixed(2)}
                    </TableCell>
                    <TableCell data-testid={`text-stock-${product.recordid}`}>{product.stock || 0}</TableCell>
                    <TableCell data-testid={`text-family-${product.recordid}`}>{product.famille}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant={product.stock && product.stock > 0 ? "default" : "destructive"}>
                          {product.stock && product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                        {product.promo === 1 && (
                          <Badge variant="destructive" className="bg-red-100 text-red-800">Sale</Badge>
                        )}
                      </div>
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
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-delete-${product.recordid}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
