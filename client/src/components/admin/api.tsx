import { useQuery } from "@tanstack/react-query";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Code, Copy, ExternalLink, Key, Server, Database, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ApiEndpoint {
  method: string;
  endpoint: string;
  description: string;
  parameters?: string[];
  response: string;
}

const apiEndpoints: ApiEndpoint[] = [
  {
    method: "GET",
    endpoint: "/api/products",
    description: "Get all products with full PRODUIT schema",
    response: "Array of Product objects with 39+ fields"
  },
  {
    method: "GET",
    endpoint: "/api/products/:id",
    description: "Get specific product by ID",
    response: "Single Product object"
  },
  {
    method: "POST",
    endpoint: "/api/products",
    description: "Create new product",
    parameters: ["codeBarre", "refProduit", "produit", "pv1Ht", "stock", "..."],
    response: "Created Product object"
  },
  {
    method: "PUT",
    endpoint: "/api/products/:id",
    description: "Update existing product",
    parameters: ["Any PRODUIT schema fields to update"],
    response: "Updated Product object"
  },
  {
    method: "DELETE",
    endpoint: "/api/products/:id",
    description: "Delete product by ID",
    response: "Success confirmation"
  },
  {
    method: "GET",
    endpoint: "/api/orders",
    description: "Get all orders with customer and item details",
    response: "Array of Order objects with related data"
  },
  {
    method: "GET",
    endpoint: "/api/orders/:id",
    description: "Get specific order by ID",
    response: "Single Order object with items and customer"
  },
  {
    method: "POST",
    endpoint: "/api/orders",
    description: "Create new order",
    parameters: ["customerId", "items", "deliveryAddress", "notes"],
    response: "Created Order object"
  },
  {
    method: "PUT",
    endpoint: "/api/orders/:id/status",
    description: "Update order status",
    parameters: ["status: pending|processing|shipped|delivered|cancelled"],
    response: "Updated Order object"
  },
  {
    method: "GET",
    endpoint: "/api/customers",
    description: "Get all customers with order history",
    response: "Array of Customer objects with orders"
  },
  {
    method: "GET",
    endpoint: "/api/customers/:id",
    description: "Get specific customer with full order history",
    response: "Single Customer object with orders"
  },
  {
    method: "POST",
    endpoint: "/api/customers",
    description: "Create new customer",
    parameters: ["firstName", "lastName", "phone", "email?"],
    response: "Created Customer object"
  },
  {
    method: "GET",
    endpoint: "/api/stats",
    description: "Get dashboard statistics",
    response: "Stats object with totalProducts, totalOrders, totalCustomers, revenue"
  }
];

export default function ApiDocumentation() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Code copied to clipboard"
      });
    });
  };

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    if (endpoint.method !== "GET") {
      toast({
        title: "Test Limitation",
        description: "Only GET endpoints can be tested from this interface",
        variant: "destructive"
      });
      return;
    }

    setIsTestLoading(true);
    setSelectedEndpoint(endpoint);
    
    try {
      const response = await fetch(endpoint.endpoint);
      const data = await response.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestLoading(false);
    }
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'POST': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'DELETE': return 'bg-red-100 text-red-800 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" data-testid="text-api-title">
            <Server className="h-5 w-5" />
            API Documentation & Testing
          </CardTitle>
          <p className="text-sm text-gray-600">
            Complete REST API endpoints for desktop application integration
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints" data-testid="tab-endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples" data-testid="tab-examples">Code Examples</TabsTrigger>
          <TabsTrigger value="testing" data-testid="tab-testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Endpoints</CardTitle>
              <p className="text-sm text-gray-600">
                All endpoints return JSON data and support the PRODUIT schema with 39+ fields
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Method</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Parameters</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiEndpoints.map((endpoint, index) => (
                      <TableRow key={index} data-testid={`row-endpoint-${index}`}>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getMethodBadgeColor(endpoint.method)}
                            data-testid={`badge-method-${index}`}
                          >
                            {endpoint.method}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm" data-testid={`code-endpoint-${index}`}>
                            {endpoint.endpoint}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm" data-testid={`text-description-${index}`}>
                          {endpoint.description}
                        </TableCell>
                        <TableCell className="text-sm" data-testid={`text-parameters-${index}`}>
                          {endpoint.parameters ? endpoint.parameters.join(", ") : "None"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(endpoint.endpoint)}
                              data-testid={`button-copy-${index}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            {endpoint.method === "GET" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => testEndpoint(endpoint)}
                                data-testid={`button-test-${index}`}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  JavaScript/Node.js Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto" data-testid="code-javascript">
                  <code>{`// Get all products
fetch('/api/products')
  .then(res => res.json())
  .then(products => {
    console.log('Products:', products);
  });

// Create new product
fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    codeBarre: '1234567890',
    refProduit: 'REF001',
    produit: 'Sample Product',
    pv1Ht: 29.99,
    stock: 100
  })
})
.then(res => res.json())
.then(product => {
  console.log('Created:', product);
});`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(`// Get all products
fetch('/api/products')
  .then(res => res.json())
  .then(products => {
    console.log('Products:', products);
  });`)}
                  data-testid="button-copy-javascript"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  cURL Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto" data-testid="code-curl">
                  <code>{`# Get all products
curl -X GET http://localhost:5000/api/products

# Create new product
curl -X POST http://localhost:5000/api/products \\
  -H "Content-Type: application/json" \\
  -d '{
    "codeBarre": "1234567890",
    "refProduit": "REF001",
    "produit": "Sample Product",
    "pv1Ht": 29.99,
    "stock": 100
  }'

# Update order status
curl -X PUT http://localhost:5000/api/orders/1/status \\
  -H "Content-Type: application/json" \\
  -d '{"status": "shipped"}'`}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(`curl -X GET http://localhost:5000/api/products`)}
                  data-testid="button-copy-curl"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Code
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">API Status & Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Status:</span>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100" data-testid="badge-api-status">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Products:</span>
                    <span className="font-mono" data-testid="text-api-products">
                      {stats?.totalProducts || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Orders:</span>
                    <span className="font-mono" data-testid="text-api-orders">
                      {stats?.totalOrders || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Customers:</span>
                    <span className="font-mono" data-testid="text-api-customers">
                      {stats?.totalCustomers || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Live API Testing</CardTitle>
                <p className="text-xs text-gray-600">
                  Test GET endpoints directly from this interface
                </p>
              </CardHeader>
              <CardContent>
                {selectedEndpoint && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge className={getMethodBadgeColor(selectedEndpoint.method)}>
                        {selectedEndpoint.method}
                      </Badge>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {selectedEndpoint.endpoint}
                      </code>
                    </div>
                    
                    {isTestLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Testing endpoint...</span>
                      </div>
                    ) : testResponse && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Response:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(testResponse)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-xs overflow-x-auto max-h-64 overflow-y-auto">
                          <code data-testid="code-test-response">{testResponse}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}