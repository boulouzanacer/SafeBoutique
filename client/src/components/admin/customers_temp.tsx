import { useQuery } from "@tanstack/react-query";
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
import { Eye, Loader2, Mail, Phone, MapPin } from "lucide-react";
import { Customer, Order } from "@shared/schema";
import { useState } from "react";

export default function Customers() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch customer orders when viewing details
  const { data: customerOrders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders", "customer", selectedCustomer?.id],
    queryFn: async () => {
      if (!selectedCustomer?.id) return [];
      const response = await fetch(`/api/orders?customerId=${selectedCustomer.id}`);
      if (!response.ok) return [];
      const allOrders = await response.json();
      return allOrders.filter((order: any) => order.customerId === selectedCustomer.id);
    },
    enabled: !!selectedCustomer?.id && isDetailsOpen
  });

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsOpen(true);
  };

  const calculateCustomerStats = (customer: Customer) => {
    // This would normally be calculated from actual order data
    // For now, we'll use placeholder values since we don't have the relationship set up
    return {
      totalOrders: 0,
      totalSpent: 0
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" data-testid="loading-customers" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-customers-title">Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500" data-testid="text-no-customers">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => {
                    const stats = calculateCustomerStats(customer);
                    return (
                      <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                        <TableCell data-testid={`text-id-${customer.id}`}>{customer.id}</TableCell>
                        <TableCell data-testid={`text-name-${customer.id}`}>
                          {customer.firstName} {customer.lastName}
                        </TableCell>
                        <TableCell data-testid={`text-email-${customer.id}`}>
                          {customer.email || (
                            <span className="text-gray-400 italic">Not provided</span>
                          )}
                        </TableCell>
                        <TableCell data-testid={`text-phone-${customer.id}`}>
                          {customer.phone}
                        </TableCell>
                        <TableCell data-testid={`text-location-${customer.id}`}>
                          {customer.city && customer.state 
                            ? `${customer.city}, ${customer.state}`
                            : <span className="text-gray-400 italic">Not provided</span>
                          }
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={customer.isRegistered ? "default" : "secondary"}
                            className={customer.isRegistered 
                              ? "bg-green-100 text-green-800 hover:bg-green-100" 
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                            }
                            data-testid={`badge-type-${customer.id}`}
                          >
                            {customer.isRegistered ? "Registered" : "Guest"}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-joined-${customer.id}`}>
                          {new Date(customer.createdAt!).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewCustomerDetails(customer)}
                            data-testid={`button-view-${customer.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle data-testid="text-customer-details-title">
              Customer Details - {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Full Name:</span>
                      <span data-testid="text-details-full-name">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span data-testid="text-details-email">
                        {selectedCustomer.email || (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span data-testid="text-details-phone">
                        {selectedCustomer.phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Account Type:</span>
                      <Badge 
                        variant={selectedCustomer.isRegistered ? "default" : "secondary"}
                        className={selectedCustomer.isRegistered 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                        data-testid="badge-details-type"
                      >
                        {selectedCustomer.isRegistered ? "Registered User" : "Guest Customer"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Joined:</span>
                      <span data-testid="text-details-joined">
                        {new Date(selectedCustomer.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      Address Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Address:</span>
                      <div className="bg-gray-50 p-3 rounded-md" data-testid="text-details-address">
                        {selectedCustomer.address ? (
                          <div>
                            <p>{selectedCustomer.address}</p>
                            {(selectedCustomer.city || selectedCustomer.state || selectedCustomer.zipCode) && (
                              <p>
                                {selectedCustomer.city && `${selectedCustomer.city}, `}
                                {selectedCustomer.state && `${selectedCustomer.state} `}
                                {selectedCustomer.zipCode}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No address provided</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {customerOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500" data-testid="text-no-orders">
                      No orders found for this customer
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerOrders.map((order) => (
                          <TableRow key={order.id} data-testid={`customer-order-${order.id}`}>
                            <TableCell className="font-mono">
                              #{order.orderNumber}
                            </TableCell>
                            <TableCell>
                              {new Date(order.createdAt!).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              ${order.total.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary"
                                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              >
                                {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
