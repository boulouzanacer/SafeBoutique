import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminTableSkeleton } from "@/components/skeletons/admin-table-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import AnimatedText from "@/components/animated-text";
import LanguageTransition from "@/components/language-transition";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Package, Loader2, CheckCircle2 } from "lucide-react";
import { Order, OrderItem, Product, Customer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface OrderWithDetails extends Order {
  customer: Customer | null;
  items: (OrderItem & { product: Product })[];
}

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [justUpdatedOrderId, setJustUpdatedOrderId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: orders = [], isLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      setUpdatingOrderId(orderId);
      const response = await apiRequest(`/api/orders/${orderId}/status`, "PUT", { status });
      return response.json();
    },
    onSuccess: (data, variables) => {
      setUpdatingOrderId(null);
      setJustUpdatedOrderId(variables.orderId);
      
      // Optimistically update the cache immediately
      queryClient.setQueryData(["/api/orders"], (oldData: OrderWithDetails[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(order => 
          order.id === variables.orderId 
            ? { ...order, status: variables.status }
            : order
        );
      });
      
      // Still invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Success",
        description: "Order status updated successfully",
        className: "border-green-200 bg-green-50 text-green-800"
      });

      // Clear the success indicator after animation
      setTimeout(() => {
        setJustUpdatedOrderId(null);
      }, 2000);
    },
    onError: (error: any) => {
      setUpdatingOrderId(null);
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      });
    }
  });

  const handleStatusChange = (orderId: number, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const viewOrderDetails = (order: OrderWithDetails) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'processing':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    }
  };

  if (isLoading) {
    return <AdminTableSkeleton rows={6} columns={7} hasActions={true} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-orders-title">
            <AnimatedText translationKey="orders.title" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><AnimatedText translationKey="orders.number" /></TableHead>
                  <TableHead><AnimatedText translationKey="orders.customer" /></TableHead>
                  <TableHead><AnimatedText translationKey="orders.date" /></TableHead>
                  <TableHead><AnimatedText translationKey="orders.total" /></TableHead>
                  <TableHead><AnimatedText translationKey="common.payment" /></TableHead>
                  <TableHead><AnimatedText translationKey="orders.status" /></TableHead>
                  <TableHead><AnimatedText translationKey="orders.actions" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500" data-testid="text-no-orders">
{t("orders.noResults", "No orders found")}
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow 
                      key={order.id} 
                      data-testid={`row-order-${order.id}`}
                      className={`transition-all duration-500 ${
                        justUpdatedOrderId === order.id 
                          ? 'bg-green-50 border-l-4 border-l-green-400' 
                          : ''
                      }`}
                    >
                      <TableCell className="font-mono" data-testid={`text-order-number-${order.id}`}>
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell data-testid={`text-customer-${order.id}`}>
                        {order.customer 
                          ? `${order.customer.firstName} ${order.customer.lastName}`
                          : t("common.guest")
                        }
                      </TableCell>
                      <TableCell data-testid={`text-date-${order.id}`}>
                        {new Date(order.createdAt!).toLocaleDateString()}
                      </TableCell>
                      <TableCell data-testid={`text-total-${order.id}`}>
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell data-testid={`text-payment-${order.id}`}>
                        <Badge variant="outline">{t("common.cod")}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={getStatusBadgeVariant(order.status || 'pending')}
                            className={`${getStatusBadgeClass(order.status || 'pending')} transition-all duration-500 ${
                              justUpdatedOrderId === order.id 
                                ? 'ring-2 ring-green-400 ring-offset-1 scale-105' 
                                : ''
                            }`}
                            data-testid={`badge-status-${order.id}`}
                          >
                            {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                          </Badge>
                          {justUpdatedOrderId === order.id && (
                            <CheckCircle2 
                              className="h-4 w-4 text-green-600 animate-pulse" 
                              data-testid={`icon-success-${order.id}`}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                            data-testid={`button-view-${order.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            key={`${order.id}-${order.status}`}
                            value={order.status || 'pending'}
                            onValueChange={(status) => handleStatusChange(order.id, status)}
                            disabled={updatingOrderId === order.id}
                          >
                            <SelectTrigger 
                              className={`w-32 transition-all duration-300 ${
                                updatingOrderId === order.id 
                                  ? 'opacity-60 cursor-not-allowed' 
                                  : ''
                              }`} 
                              data-testid={`select-status-${order.id}`}
                            >
                              {updatingOrderId === order.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Package className="h-4 w-4 mr-2" />
                              )}
                              <span className="capitalize">
                                {order.status || 'pending'}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
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

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-order-details-title">
              Order Details - #{selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              View complete order information, customer details, and item list
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Order Number:</span>
                      <span className="font-mono" data-testid="text-details-order-number">#{selectedOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date:</span>
                      <span data-testid="text-details-date">
                        {new Date(selectedOrder.createdAt!).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge 
                        variant={getStatusBadgeVariant(selectedOrder.status || 'pending')}
                        className={getStatusBadgeClass(selectedOrder.status || 'pending')}
                        data-testid="badge-details-status"
                      >
                        {(selectedOrder.status || 'pending').charAt(0).toUpperCase() + (selectedOrder.status || 'pending').slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment:</span>
                      <Badge variant="outline">Cash on Delivery</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedOrder.customer ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Name:</span>
                          <span data-testid="text-details-customer-name">
                            {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Email:</span>
                          <span data-testid="text-details-customer-email">
                            {selectedOrder.customer.email || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span data-testid="text-details-customer-phone">
                            {selectedOrder.customer.phone}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-500" data-testid="text-guest-customer">
                        Guest Customer
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p data-testid="text-delivery-address">{selectedOrder.deliveryAddress}</p>
                  {selectedOrder.notes && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Order Notes:</h4>
                      <p className="text-sm bg-gray-50 p-3 rounded-md" data-testid="text-order-notes">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id} data-testid={`item-row-${item.id}`}>
                          <TableCell data-testid={`item-name-${item.id}`}>
                            {item.product.produit}
                          </TableCell>
                          <TableCell data-testid={`item-ref-${item.id}`}>
                            {item.product.refProduit}
                          </TableCell>
                          <TableCell data-testid={`item-quantity-${item.id}`}>
                            {item.quantity}
                          </TableCell>
                          <TableCell data-testid={`item-price-${item.id}`}>
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell data-testid={`item-total-${item.id}`}>
                            {formatCurrency(item.price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Order Totals */}
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span data-testid="text-details-subtotal">{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery:</span>
                      <span data-testid="text-details-delivery">{formatCurrency(selectedOrder.delivery || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span data-testid="text-details-total">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}