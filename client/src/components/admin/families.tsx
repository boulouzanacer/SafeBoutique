import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AnimatedText from "@/components/animated-text";

import type { Family } from "@shared/schema";

const familySchema = z.object({
  name: z.string().min(1, "Family name is required").max(50, "Family name too long"),
});

type FamilyFormData = z.infer<typeof familySchema>;

export default function Families() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<(Family & { productsCount: number }) | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<FamilyFormData>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      name: "",
    },
  });

  // Get families from the new families management API
  const { data: families = [], isLoading, refetch } = useQuery<(Family & { productsCount: number })[]>({
    queryKey: ["/api/families-management"],
  });

  const filteredFamilies = families.filter(family =>
    family.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFamily = () => {
    setEditingFamily(null);
    form.reset({ name: "" });
    setIsDialogOpen(true);
  };

  const handleEditFamily = (family: Family & { productsCount: number }) => {
    setEditingFamily(family);
    form.reset({ name: family.name });
    setIsDialogOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/families-management/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete family");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families-management"] });
      toast({
        title: t("families.deleteSuccess"),
        description: "Family deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteFamily = async (family: Family & { productsCount: number }) => {
    if (family.productsCount > 0) {
      toast({
        title: "Cannot Delete",
        description: t("families.deleteError"),
        variant: "destructive",
      });
      return;
    }

    deleteMutation.mutate(family.id);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: FamilyFormData) => {
      const url = editingFamily 
        ? `/api/families-management/${editingFamily.id}` 
        : "/api/families-management";
      const method = editingFamily ? "PUT" : "POST";
      
      const response = await apiRequest(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${editingFamily ? 'update' : 'create'} family`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families-management"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: t("families.success"),
        description: editingFamily ? "Family updated successfully" : "Family created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FamilyFormData) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle data-testid="text-families-title">
              <AnimatedText translationKey="families.title" />
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("families.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-families"
                />
              </div>
              <Button onClick={handleAddFamily} data-testid="button-add-family">
                <Plus className="mr-2 h-4 w-4" />
                <AnimatedText translationKey="families.add" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead><AnimatedText translationKey="families.name" /></TableHead>
                  <TableHead>Products Count</TableHead>
                  <TableHead><AnimatedText translationKey="families.actions" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFamilies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500" data-testid="text-no-families">
                      {searchTerm ? "No families found matching your search." : t("families.noResults")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFamilies.map((family) => (
                    <TableRow key={family.id} data-testid={`row-family-${family.id}`}>
                      <TableCell className="font-mono" data-testid={`text-family-id-${family.id}`}>
                        #{family.id}
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`text-family-name-${family.id}`}>
                        {family.name}
                      </TableCell>
                      <TableCell data-testid={`text-products-count-${family.id}`}>
                        {family.productsCount} products
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditFamily(family)}
                            data-testid={`button-edit-${family.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFamily(family)}
                            disabled={family.productsCount > 0}
                            className={family.productsCount > 0 ? "opacity-50 cursor-not-allowed" : ""}
                            data-testid={`button-delete-${family.id}`}
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

      {/* Add/Edit Family Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="dialog-family-form">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {editingFamily ? (
                <AnimatedText translationKey="families.edit" />
              ) : (
                <AnimatedText translationKey="families.add" />
              )}
            </DialogTitle>
            <DialogDescription>
              {editingFamily ? "Edit the family information" : "Add a new product family"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel><AnimatedText translationKey="families.name" /></FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("families.enterName")}
                        data-testid="input-family-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={saveMutation.isPending}
                  data-testid="button-save-family"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  <AnimatedText translationKey="common.save" />
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}