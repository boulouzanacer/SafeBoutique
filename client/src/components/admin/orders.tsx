import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Eye, Package, Loader2 } from "lucide-react";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Order status updated successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
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
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" data-testid="loading-orders" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-orders-title">Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500" data-testid="text-no-orders">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-mono" data-testid={`text-order-number-${order.id}`}>
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell data-testid={`text-customer-${order.id}`}>
                        {order.customer 
                          ? `${order.customer.firstName} ${order.customer.lastName}`
                          : 'Guest Customer'
                        }
                      </TableCell>
                      <TableCell data-testid={`text-date-${order.id}`}>
                        {new Date(order.createdAt!).toLocaleDateString()}
                      </TableCell>
                      <TableCell data-testid={`text-total-${order.id}`}>
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell data-testid={`text-payment-${order.id}`}>
                        <Badge variant="outline">COD</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(order.status || 'pending')}
                          className={getStatusBadgeClass(order.status || 'pending')}
                          data-testid={`badge-status-${order.id}`}
                        >
                          {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                        </Badge>
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
                            value={order.status || 'pending'}
                            onValueChange={(status) => handleStatusChange(order.id, status)}
                          >
                            <SelectTrigger className="w-32" data-testid={`select-status-${order.id}`}>
                              <Package className="h-4 w-4 mr-2" />
                              <SelectValue />
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