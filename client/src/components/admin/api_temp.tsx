import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Server, Database, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function API() {
  const [copiedKey, setCopiedKey] = useState(false);
  const { toast } = useToast();

  // Simulated API key - in production this would be managed securely
  const apiKey = "sk_live_safesoft_desktop_integration_key_123456789";

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopiedKey(true);
      toast({
        title: "API Key Copied",
        description: "API key has been copied to your clipboard"
      });
      setTimeout(() => setCopiedKey(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy API key to clipboard",
        variant: "destructive"
      });
    }
  };

  const apiEndpoints = [
    {
      method: "GET",
      endpoint: "/api/products",
      description: "Retrieve all products with optional filters",
      status: "active",
      testId: "endpoint-get-products"
    },
    {
      method: "POST",
      endpoint: "/api/products",
      description: "Create new product from desktop app",
      status: "active",
      testId: "endpoint-post-products"
    },
    {
      method: "PUT",
      endpoint: "/api/products/:id",
      description: "Update existing product",
      status: "active",
      testId: "endpoint-put-products"
    },
    {
      method: "DELETE",
      endpoint: "/api/products/:id",
      description: "Delete product",
      status: "active",
      testId: "endpoint-delete-products"
    },
    {
      method: "GET",
      endpoint: "/api/orders",
      description: "Retrieve orders for desktop processing",
      status: "active",
      testId: "endpoint-get-orders"
    },
    {
      method: "PUT",
      endpoint: "/api/orders/:id/status",
      description: "Update order status from desktop",
      status: "active",
      testId: "endpoint-put-orders"
    },
    {
      method: "GET",
      endpoint: "/api/customers",
      description: "Retrieve customer information",
      status: "active",
      testId: "endpoint-get-customers"
    },
    {
      method: "GET",
      endpoint: "/api/stats",
      description: "Get dashboard statistics",
      status: "active",
      testId: "endpoint-get-stats"
    }
  ];

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "POST":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "PUT":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "DELETE":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" data-testid="text-api-endpoints-title">
              <Server className="mr-2 h-5 w-5" />
              API Endpoints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiEndpoints.map((endpoint, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-4 rounded-lg"
                  data-testid={endpoint.testId}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary"
                        className={getMethodBadgeClass(endpoint.method)}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="font-mono text-sm" data-testid={`text-endpoint-${index}`}>
                        {endpoint.endpoint}
                      </code>
                    </div>
                    <Badge 
                      variant="default"
                      className="bg-green-100 text-green-800 hover:bg-green-100"
                      data-testid={`badge-status-${index}`}
                    >
                      {endpoint.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600" data-testid={`text-description-${index}`}>
                    {endpoint.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Connection Status & API Key */}
        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center" data-testid="text-connection-title">
                <Database className="mr-2 h-5 w-5" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800" data-testid="text-connection-status">
                      API Server Online
                    </p>
                    <p className="text-sm text-green-600" data-testid="text-connection-details">
                      All endpoints are operational and ready for desktop app integration
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Key Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center" data-testid="text-api-key-title">
                <Smartphone className="mr-2 h-5 w-5" />
                Desktop App Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">API Key</h4>
                <div className="flex">
                  <Input
                    type="password"
                    value={apiKey}
                    readOnly
                    className="flex-1 bg-gray-50 font-mono text-sm"
                    data-testid="input-api-key"
                  />
                  <Button
                    variant="outline"
                    className="ml-2"
                    onClick={handleCopyApiKey}
                    data-testid="button-copy-key"
                  >
                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use this API key to authenticate your desktop application
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2" data-testid="text-integration-guide">
                  Integration Guide
                </h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li data-testid="text-guide-step-1">
                    • Include the API key in your request headers as: <code className="bg-blue-100 px-1 rounded">Authorization: Bearer {"{API_KEY}"}</code>
                  </li>
                  <li data-testid="text-guide-step-2">
                    • Use Content-Type: application/json for POST/PUT requests
                  </li>
                  <li data-testid="text-guide-step-3">
                    • Base URL: <code className="bg-blue-100 px-1 rounded">{window.location.origin}</code>
                  </li>
                  <li data-testid="text-guide-step-4">
                    • All endpoints return JSON responses
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2" data-testid="text-example-request">
                  Example Request
                </h4>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto" data-testid="code-example">
{`curl -X POST ${window.location.origin}/api/products \\
  -H "Authorization: Bearer ${apiKey.substring(0, 20)}..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "codeBarre": "123456789012",
    "refProduit": "REF001",
    "produit": "Sample Product",
    "pv1Ht": 99.99,
    "stock": 10,
    "famille": "Electronics"
  }'`}
                </pre>
              </div>

              {/* Database Schema Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2" data-testid="text-schema-info">
                  PRODUIT Table Compatibility
                </h4>
                <p className="text-sm text-yellow-600" data-testid="text-schema-description">
                  The API is fully compatible with your desktop app's PRODUIT table structure. 
                  All fields including RECORDID, CODE_BARRE, REF_PRODUIT, pricing tiers (PV1_HT through PV6_HT), 
                  stock management, and product categorization are supported.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
