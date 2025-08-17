import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Settings, Upload, Plus, Edit, Trash2, Save, Image as ImageIcon, Globe, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface SiteSettings {
  id?: number;
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialTwitter?: string;
  footerText: string;
  headerMessage?: string;
  deliveryInfo: string;
  returnPolicy: string;
  privacyPolicy: string;
  termsOfService: string;
}

interface SliderImage {
  id?: number;
  title: string;
  description: string;
  image: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

const settingsSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  siteDescription: z.string().min(1, "Description is required"),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(1, "Phone number is required"),
  contactAddress: z.string().min(1, "Address is required"),
  socialFacebook: z.string().optional(),
  socialInstagram: z.string().optional(),
  socialTwitter: z.string().optional(),
  footerText: z.string().min(1, "Footer text is required"),
  headerMessage: z.string().optional(),
  deliveryInfo: z.string().min(1, "Delivery info is required"),
  returnPolicy: z.string().min(1, "Return policy is required"),
  privacyPolicy: z.string().min(1, "Privacy policy is required"),
  termsOfService: z.string().min(1, "Terms of service is required")
});

const sliderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().min(1, "Image is required"),
  linkUrl: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().min(0)
});

export default function SiteSettings() {
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isSliderDialogOpen, setIsSliderDialogOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<SliderImage | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const settingsForm = useForm<SiteSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "SafeSoft Boutique",
      siteDescription: "Premium quality products with excellent service",
      logo: "",
      favicon: "",
      contactEmail: "contact@safesoft.com",
      contactPhone: "+1 (555) 123-4567",
      contactAddress: "123 Business Street, City, State 12345",
      socialFacebook: "",
      socialInstagram: "",
      socialTwitter: "",
      footerText: "© 2024 SafeSoft Boutique. All rights reserved.",
      headerMessage: "",
      deliveryInfo: "Free delivery on orders over $50. Standard delivery takes 2-3 business days.",
      returnPolicy: "30-day return policy. Items must be in original condition.",
      privacyPolicy: "We respect your privacy and protect your personal information.",
      termsOfService: "By using our service, you agree to our terms and conditions."
    }
  });

  const sliderForm = useForm<SliderImage>({
    resolver: zodResolver(sliderSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      linkUrl: "",
      isActive: true,
      sortOrder: 0
    }
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
  });

  const { data: sliderImages = [], isLoading: sliderLoading } = useQuery<SliderImage[]>({
    queryKey: ["/api/slider-images"],
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: SiteSettings) => {
      const response = await apiRequest("POST", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setIsSettingsDialogOpen(false);
      toast({
        title: "Success",
        description: "Settings saved successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  });

  const createSliderMutation = useMutation({
    mutationFn: async (data: SliderImage) => {
      const response = await apiRequest("POST", "/api/slider-images", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slider-images"] });
      setIsSliderDialogOpen(false);
      sliderForm.reset();
      setEditingSlider(null);
      setImagePreview(null);
      toast({
        title: "Success",
        description: "Slider image created successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create slider image",
        variant: "destructive"
      });
    }
  });

  const updateSliderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SliderImage> }) => {
      const response = await apiRequest("PUT", `/api/slider-images/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slider-images"] });
      setIsSliderDialogOpen(false);
      sliderForm.reset();
      setEditingSlider(null);
      setImagePreview(null);
      toast({
        title: "Success",
        description: "Slider image updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update slider image",
        variant: "destructive"
      });
    }
  });

  const deleteSliderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/slider-images/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slider-images"] });
      toast({
        title: "Success",
        description: "Slider image deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete slider image",
        variant: "destructive"
      });
    }
  });

  const onSettingsSubmit = (data: SiteSettings) => {
    saveSettingsMutation.mutate(data);
  };

  const onSliderSubmit = (data: SliderImage) => {
    if (editingSlider) {
      updateSliderMutation.mutate({ id: editingSlider.id!, data });
    } else {
      createSliderMutation.mutate(data);
    }
  };

  const handleEditSlider = (slider: SliderImage) => {
    setEditingSlider(slider);
    sliderForm.reset({
      title: slider.title,
      description: slider.description,
      image: slider.image,
      linkUrl: slider.linkUrl || "",
      isActive: slider.isActive,
      sortOrder: slider.sortOrder
    });
    setImagePreview(slider.image);
    setIsSliderDialogOpen(true);
  };

  const handleDeleteSlider = (id: number) => {
    if (confirm("Are you sure you want to delete this slider image?")) {
      deleteSliderMutation.mutate(id);
    }
  };

  const handleNewSlider = () => {
    setEditingSlider(null);
    sliderForm.reset();
    setImagePreview(null);
    setIsSliderDialogOpen(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        field.onChange(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSettingsEdit = () => {
    if (settings) {
      settingsForm.reset(settings);
    }
    setIsSettingsDialogOpen(true);
  };

  if (settingsLoading || sliderLoading) {
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
          <CardTitle className="flex items-center gap-2" data-testid="text-settings-title">
            <Settings className="h-5 w-5" />
            Site Settings Management
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure your boutique's header, footer, contact information, and slider images
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" data-testid="tab-general">General Settings</TabsTrigger>
          <TabsTrigger value="slider" data-testid="tab-slider">Slider Images</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">General Site Settings</CardTitle>
                <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleSettingsEdit} data-testid="button-edit-settings">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle data-testid="text-settings-dialog-title">
                        Site Settings Configuration
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...settingsForm}>
                      <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                        <Tabs defaultValue="basic" className="space-y-4">
                          <TabsList>
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="contact">Contact & Social</TabsTrigger>
                            <TabsTrigger value="policies">Policies & Legal</TabsTrigger>
                            <TabsTrigger value="branding">Branding</TabsTrigger>
                          </TabsList>

                          <TabsContent value="basic" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={settingsForm.control}
                                name="siteName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Site Name *</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-site-name" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={settingsForm.control}
                                name="headerMessage"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Header Message</FormLabel>
                                    <FormControl>
                                      <Input {...field} value={field.value || ""} placeholder="Special offers, announcements..." data-testid="input-header-message" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={settingsForm.control}
                                name="siteDescription"
                                render={({ field }) => (
                                  <FormItem className="col-span-2">
                                    <FormLabel>Site Description *</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} rows={3} data-testid="textarea-site-description" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={settingsForm.control}
                                name="deliveryInfo"
                                render={({ field }) => (
                                  <FormItem className="col-span-2">
                                    <FormLabel>Delivery Information *</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} rows={2} data-testid="textarea-delivery-info" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="contact" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={settingsForm.control}
                                name="contactEmail"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Contact Email *</FormLabel>
                                    <FormControl>
                                      <Input {...field} type="email" data-testid="input-contact-email" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={settingsForm.control}
                                name="contactPhone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Contact Phone *</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-contact-phone" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={settingsForm.control}
                                name="contactAddress"
                                render={({ field }) => (
                                  <FormItem className="col-span-2">
                                    <FormLabel>Address *</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} rows={2} data-testid="textarea-contact-address" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={settingsForm.control}
                                name="socialFacebook"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Facebook URL</FormLabel>
                                    <FormControl>
                                      <Input {...field} value={field.value || ""} placeholder="https://facebook.com/..." data-testid="input-facebook" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={settingsForm.control}
                                name="socialInstagram"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Instagram URL</FormLabel>
                                    <FormControl>
                                      <Input {...field} value={field.value || ""} placeholder="https://instagram.com/..." data-testid="input-instagram" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="policies" className="space-y-4">
                            <div className="space-y-4">
                              <FormField
                                control={settingsForm.control}
                                name="returnPolicy"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Return Policy *</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} rows={3} data-testid="textarea-return-policy" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={settingsForm.control}
                                name="privacyPolicy"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Privacy Policy *</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} rows={3} data-testid="textarea-privacy-policy" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={settingsForm.control}
                                name="termsOfService"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Terms of Service *</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} rows={3} data-testid="textarea-terms-service" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={settingsForm.control}
                                name="footerText"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Footer Text *</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-footer-text" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="branding" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={settingsForm.control}
                                name="logo"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Logo (Base64 or URL)</FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <Input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleImageUpload(e, field)}
                                          data-testid="input-logo-upload"
                                        />
                                        <Input {...field} value={field.value || ""} placeholder="Or paste image URL/Base64" data-testid="input-logo-url" />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={settingsForm.control}
                                name="favicon"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Favicon (Base64 or URL)</FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <Input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleImageUpload(e, field)}
                                          data-testid="input-favicon-upload"
                                        />
                                        <Input {...field} value={field.value || ""} placeholder="Or paste image URL/Base64" data-testid="input-favicon-url" />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex gap-2 justify-end">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsSettingsDialogOpen(false)}
                            data-testid="button-cancel-settings"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={saveSettingsMutation.isPending}
                            data-testid="button-save-settings"
                          >
                            {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">Site Name</span>
                    </div>
                    <p className="text-sm text-gray-600" data-testid="text-current-site-name">
                      {settings?.siteName || "SafeSoft Boutique"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-sm">Contact Email</span>
                    </div>
                    <p className="text-sm text-gray-600" data-testid="text-current-email">
                      {settings?.contactEmail || "contact@safesoft.com"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-sm">Contact Phone</span>
                    </div>
                    <p className="text-sm text-gray-600" data-testid="text-current-phone">
                      {settings?.contactPhone || "+1 (555) 123-4567"}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-sm">Address</span>
                    </div>
                    <p className="text-sm text-gray-600" data-testid="text-current-address">
                      {settings?.contactAddress ? 
                        (settings.contactAddress.length > 30 ? 
                          settings.contactAddress.substring(0, 30) + "..." : 
                          settings.contactAddress) 
                        : "123 Business Street..."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slider" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Slider Images Management</CardTitle>
                <Dialog open={isSliderDialogOpen} onOpenChange={setIsSliderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleNewSlider} data-testid="button-add-slider">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Slider Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle data-testid="text-slider-dialog-title">
                        {editingSlider ? "Edit Slider Image" : "Add New Slider Image"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...sliderForm}>
                      <form onSubmit={sliderForm.handleSubmit(onSliderSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={sliderForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title *</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-slider-title" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={sliderForm.control}
                            name="sortOrder"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sort Order</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    data-testid="input-sort-order"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={sliderForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Description *</FormLabel>
                                <FormControl>
                                  <Textarea {...field} rows={3} data-testid="textarea-slider-description" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={sliderForm.control}
                            name="image"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Image *</FormLabel>
                                <FormControl>
                                  <div className="space-y-2">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(e, field)}
                                      data-testid="input-slider-image-upload"
                                    />
                                    <Input {...field} placeholder="Or paste image URL/Base64" data-testid="input-slider-image-url" />
                                    {imagePreview && (
                                      <div className="mt-2">
                                        <img 
                                          src={imagePreview} 
                                          alt="Preview" 
                                          className="w-32 h-20 object-cover rounded border"
                                          data-testid="img-slider-preview"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={sliderForm.control}
                            name="linkUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Link URL (optional)</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ""} placeholder="https://..." data-testid="input-slider-link" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={sliderForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                  <FormLabel>Active</FormLabel>
                                  <div className="text-sm text-muted-foreground">
                                    Show this image in the slider
                                  </div>
                                </div>
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    data-testid="checkbox-slider-active"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex gap-2 justify-end">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsSliderDialogOpen(false)}
                            data-testid="button-cancel-slider"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit"
                            disabled={createSliderMutation.isPending || updateSliderMutation.isPending}
                            data-testid="button-save-slider"
                          >
                            {createSliderMutation.isPending || updateSliderMutation.isPending 
                              ? "Saving..." 
                              : editingSlider ? "Update" : "Create"}
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
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sliderImages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500" data-testid="text-no-slider-images">
                          No slider images found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sliderImages.map((slider) => (
                        <TableRow key={slider.id} data-testid={`row-slider-${slider.id}`}>
                          <TableCell>
                            {slider.image && (
                              <img 
                                src={slider.image} 
                                alt={slider.title}
                                className="w-16 h-10 object-cover rounded"
                                data-testid={`img-slider-${slider.id}`}
                              />
                            )}
                          </TableCell>
                          <TableCell data-testid={`text-slider-title-${slider.id}`}>
                            {slider.title}
                          </TableCell>
                          <TableCell data-testid={`text-slider-description-${slider.id}`}>
                            {slider.description.length > 50 
                              ? slider.description.substring(0, 50) + "..."
                              : slider.description}
                          </TableCell>
                          <TableCell data-testid={`text-slider-order-${slider.id}`}>
                            {slider.sortOrder}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={slider.isActive ? "default" : "secondary"}
                              className={slider.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                              data-testid={`badge-slider-status-${slider.id}`}
                            >
                              {slider.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSlider(slider)}
                                data-testid={`button-edit-slider-${slider.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSlider(slider.id!)}
                                className="text-red-500 hover:text-red-700"
                                data-testid={`button-delete-slider-${slider.id}`}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}