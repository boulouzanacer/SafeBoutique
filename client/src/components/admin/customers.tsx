import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye, Search, Mail, Phone, Loader2 } from "lucide-react";
import { Customer, Order } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface CustomerWithOrders extends Customer {
  orders: Order[];
}

export default function Customers() {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithOrders | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery<CustomerWithOrders[]>({
    queryKey: ["/api/customers"],
  });

  const filteredCustomers = customers.filter(customer =>
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const viewCustomerDetails = async (customer: Customer) => {
    try {
      const response = await apiRequest("GET", `/api/customers/${customer.id}`);
      const customerDetails = await response.json();
      setSelectedCustomer(customerDetails);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
    }
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
          <div className="flex justify-between items-center">
            <CardTitle data-testid="text-customers-title">Customer Management</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                  data-testid="input-search-customers"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500" data-testid="text-no-customers">
                      {searchTerm ? "No customers found matching your search." : "No customers found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                      <TableCell className="font-mono" data-testid={`text-customer-id-${customer.id}`}>
                        #{customer.id}
                      </TableCell>
                      <TableCell data-testid={`text-customer-name-${customer.id}`}>
                        <div>
                          <div className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </div>
                          {customer.email && (
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Mail className="h-3 w-3 mr-1" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-customer-contact-${customer.id}`}>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {customer.phone}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-customer-orders-${customer.id}`}>
                        <Badge variant="outline">
                          {customer.orders?.length || 0} orders
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-customer-date-${customer.id}`}>
                        {customer.createdAt 
                          ? new Date(customer.createdAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="default"
                          className="bg-green-100 text-green-800 hover:bg-green-100"
                          data-testid={`badge-customer-status-${customer.id}`}
                        >
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewCustomerDetails(customer)}
                          data-testid={`button-view-customer-${customer.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
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
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Customer ID:</span>
                      <span className="font-mono" data-testid="text-details-customer-id">
                        #{selectedCustomer.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Full Name:</span>
                      <span data-testid="text-details-customer-fullname">
                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                      </span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span data-testid="text-details-customer-email">
                          {selectedCustomer.email}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span data-testid="text-details-customer-phone">
                        {selectedCustomer.phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Registration:</span>
                      <span data-testid="text-details-registration-date">
                        {selectedCustomer.createdAt 
                          ? new Date(selectedCustomer.createdAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Order Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Orders:</span>
                      <span className="font-bold" data-testid="text-details-total-orders">
                        {selectedCustomer.orders?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Spent:</span>
                      <span className="font-bold" data-testid="text-details-total-spent">
                        {formatCurrency(selectedCustomer.orders?.reduce((sum, order) => sum + order.total, 0) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg. Order Value:</span>
                      <span data-testid="text-details-avg-order">
                        {selectedCustomer.orders?.length 
                          ? formatCurrency(selectedCustomer.orders.reduce((sum, order) => sum + order.total, 0) / selectedCustomer.orders.length)
                          : formatCurrency(0)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Order:</span>
                      <span data-testid="text-details-last-order">
                        {selectedCustomer.orders?.length 
                          ? new Date(Math.max(...selectedCustomer.orders.map(o => new Date(o.createdAt!).getTime()))).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
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
                  {selectedCustomer.orders?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500" data-testid="text-no-order-history">
                      No order history available
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedCustomer.orders?.map((order) => (
                          <TableRow key={order.id} data-testid={`history-order-${order.id}`}>
                            <TableCell className="font-mono" data-testid={`history-order-number-${order.id}`}>
                              #{order.orderNumber}
                            </TableCell>
                            <TableCell data-testid={`history-order-date-${order.id}`}>
                              {new Date(order.createdAt!).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                data-testid={`history-order-status-${order.id}`}
                              >
                                {(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell data-testid={`history-order-total-${order.id}`}>
                              {formatCurrency(order.total)}
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