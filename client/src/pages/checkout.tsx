import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, CreditCard, User } from "lucide-react";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  notes: z.string().optional(),
  createAccount: z.boolean().default(false)
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { items, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
      createAccount: false
    }
  });

  const subtotal = getTotalPrice();
  const delivery = 9.99;
  const total = subtotal + delivery;

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const orderData = {
        subtotal,
        delivery,
        total,
        paymentMethod: "cod",
        notes: data.notes,
        deliveryAddress: `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`,
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || undefined,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          isRegistered: data.createAccount
        },
        items: items.map(item => ({
          productId: item.product.recordid,
          quantity: item.quantity,
          price: item.product.pv1Ht || 0
        }))
      };

      const response = await apiRequest("/api/orders", "POST", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.orderNumber} has been placed. You will receive a confirmation call shortly.`
      });
      clearCart();
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Order Failed",
        description: error.message || "There was an error placing your order. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CheckoutFormData) => {
    createOrderMutation.mutate(data);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4" data-testid="text-empty-cart">Your cart is empty</h1>
              <p className="text-gray-600 mb-6">Add some products to your cart before checking out.</p>
              <Button onClick={() => setLocation("/")} data-testid="button-continue-shopping">
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shopping
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center" data-testid="text-checkout-title">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Checkout
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Guest Checkout Notice */}
                {!isAuthenticated && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-blue-900">Guest Checkout</h4>
                    </div>
                    <p className="text-blue-700 text-sm mb-3">
                      You're checking out as a guest. Your order will be processed via Cash on Delivery (COD).
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation("/login")}
                        data-testid="button-login-checkout"
                      >
                        Login to Account
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation("/signup")}
                        data-testid="button-signup-checkout"
                      >
                        Create Account
                      </Button>
                    </div>
                  </div>
                )}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Customer Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4" data-testid="text-customer-info">Customer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-first-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} type="tel" data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4" data-testid="text-delivery-address">Delivery Address</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-city" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-state" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-zip" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Any special instructions for delivery..."
                              data-testid="textarea-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Create Account */}
                    <FormField
                      control={form.control}
                      name="createAccount"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-create-account"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Create an account for faster checkout next time</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createOrderMutation.isPending}
                      data-testid="button-place-order"
                    >
                      {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-order-summary">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.recordid} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium" data-testid={`text-summary-product-${item.product.recordid}`}>
                          {item.product.produit}
                        </p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span data-testid={`text-summary-price-${item.product.recordid}`}>
                        {formatCurrency((item.product.pv1Ht || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span data-testid="text-summary-subtotal">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery:</span>
                    <span data-testid="text-summary-delivery">{formatCurrency(delivery)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span data-testid="text-summary-total">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CreditCard className="text-yellow-600 mr-3 h-5 w-5" />
                    <div>
                      <p className="font-medium text-yellow-800" data-testid="text-payment-method">Cash on Delivery (COD)</p>
                      <p className="text-sm text-yellow-600">Pay when your order is delivered</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
