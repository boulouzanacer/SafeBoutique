import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AnimatedText from "@/components/animated-text";

interface BulkImportResult {
  success: boolean;
  imported: number;
  errors: Array<{
    row: number;
    product: any;
    error: string;
  }>;
  message: string;
}

interface BulkExportResult {
  success: boolean;
  filename: string;
  count: number;
  message: string;
}

export default function BulkImportExport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null);
  const [exportResult, setExportResult] = useState<BulkExportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Export Products Mutation
  const exportMutation = useMutation({
    mutationFn: async (): Promise<BulkExportResult> => {
      const response = await fetch('/api/products/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setExportResult(result);
      if (result.success) {
        toast({
          title: "Export Successful",
          description: `Exported ${result.count} products to ${result.filename}`,
        });
      } else {
        toast({
          title: "Export Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting products",
        variant: "destructive",
      });
    }
  });

  // Import Products Mutation
  const importMutation = useMutation({
    mutationFn: async (file: File): Promise<BulkImportResult> => {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${result.imported} products`,
        });
      } else {
        toast({
          title: "Import Completed with Errors",
          description: `Imported ${result.imported} products with ${result.errors.length} errors`,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "An error occurred while importing products",
        variant: "destructive",
      });
    }
  });

  // Generate Template Mutation
  const templateMutation = useMutation({
    mutationFn: async (): Promise<BulkExportResult> => {
      const response = await fetch('/api/products/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Template generation failed');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        // Download the template file
        window.open(`/api/products/export/${result.filename}`, '_blank');
        toast({
          title: "Template Generated",
          description: "CSV import template has been generated and downloaded",
        });
      }
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const allowedExtensions = ['.csv', '.xls', '.xlsx'];
      const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (allowedTypes.includes(file.type) || hasValidExtension) {
        setSelectedFile(file);
        setImportResult(null);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV or Excel file (.csv, .xls, .xlsx)",
          variant: "destructive",
        });
      }
    }
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to import",
        variant: "destructive",
      });
      return;
    }
    importMutation.mutate(selectedFile);
  };

  const handleDownloadExport = () => {
    if (exportResult?.filename) {
      window.open(`/api/products/export/${exportResult.filename}`, '_blank');
    }
  };

  const handleGenerateTemplate = () => {
    templateMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight"><AnimatedText translationKey="bulk.title" /></h2>
        <p className="text-muted-foreground">
          <AnimatedText translationKey="bulk.description" />
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Export Section */}
        <Card data-testid="card-export">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              <AnimatedText translationKey="bulk.exportTitle" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <AnimatedText translationKey="bulk.exportDescription" />
            </p>
            
            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="w-full"
              data-testid="button-export"
            >
              {exportMutation.isPending ? (
                <AnimatedText translationKey="bulk.exporting" />
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  <AnimatedText translationKey="bulk.exportButton" />
                </>
              )}
            </Button>

            {exportResult && (
              <Alert className={exportResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-start gap-2">
                  {exportResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription>
                      {exportResult.message}
                    </AlertDescription>
                    {exportResult.success && (
                      <Button
                        variant="link"
                        onClick={handleDownloadExport}
                        className="p-0 h-auto mt-2 text-green-600 hover:text-green-800"
                        data-testid="button-download-export"
                      >
                        <AnimatedText translationKey="bulk.downloadFile" />
                      </Button>
                    )}
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card data-testid="card-import">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              <AnimatedText translationKey="bulk.importTitle" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <AnimatedText translationKey="bulk.importDescription" />
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="csvFile"><AnimatedText translationKey="bulk.selectFile" /></Label>
                <Input
                  ref={fileInputRef}
                  id="csvFile"
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileSelect}
                  className="mt-2"
                  data-testid="input-csv-file"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleImport}
                  disabled={!selectedFile || importMutation.isPending}
                  className="flex-1"
                  data-testid="button-import"
                >
                  {importMutation.isPending ? (
                    <AnimatedText translationKey="common.loading" />
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      <AnimatedText translationKey="bulk.importButton" />
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleGenerateTemplate}
                  disabled={templateMutation.isPending}
                  data-testid="button-template"
                >
                  {templateMutation.isPending ? (
                    <AnimatedText translationKey="common.loading" />
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      <AnimatedText translationKey="bulk.getTemplate" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {importMutation.isPending && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                </div>
                <Progress value={undefined} className="w-full" />
              </div>
            )}

            {importResult && (
              <Alert className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-start gap-2">
                  {importResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <AlertDescription>
                      <div>
                        <strong>Import Results:</strong>
                        <ul className="mt-2 space-y-1">
                          <li>• Successfully imported: {importResult.imported} products</li>
                          {importResult.errors.length > 0 && (
                            <li className="text-red-600">• Errors: {importResult.errors.length} products failed</li>
                          )}
                        </ul>
                      </div>
                      
                      {importResult.errors.length > 0 && importResult.errors.length <= 5 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-medium">View Error Details</summary>
                          <div className="mt-2 space-y-1 text-xs">
                            {importResult.errors.slice(0, 5).map((error, index) => (
                              <div key={index} className="p-2 bg-red-100 rounded">
                                <strong>Row {error.row}:</strong> {error.error}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle><AnimatedText translationKey="bulk.instructions" /></CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium"><AnimatedText translationKey="bulk.fileFormat" /></h4>
            <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
              <li><AnimatedText translationKey="bulk.supportsCsv" /></li>
              <li><AnimatedText translationKey="bulk.columnFormat" /></li>
              <li><AnimatedText translationKey="bulk.firstRow" /></li>
              <li><AnimatedText translationKey="bulk.requiredColumns" /></li>
              <li><AnimatedText translationKey="bulk.maxFileSize" /></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium"><AnimatedText translationKey="bulk.importBehavior" /></h4>
            <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
              <li><AnimatedText translationKey="bulk.matchedBy" /></li>
              <li><AnimatedText translationKey="bulk.existingUpdate" /></li>
              <li><AnimatedText translationKey="bulk.newProducts" /></li>
              <li><AnimatedText translationKey="bulk.invalidRows" /></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium"><AnimatedText translationKey="bulk.recommendedProcess" /></h4>
            <ol className="mt-2 space-y-1 list-decimal list-inside text-muted-foreground">
              <li><AnimatedText translationKey="bulk.downloadTemplate" /></li>
              <li><AnimatedText translationKey="bulk.prepareData" /></li>
              <li><AnimatedText translationKey="bulk.testSmallFile" /></li>
              <li><AnimatedText translationKey="bulk.reviewResults" /></li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}