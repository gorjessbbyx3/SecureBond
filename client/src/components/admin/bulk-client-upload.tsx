import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, FileText, AlertCircle, CheckCircle, Users } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
  success: boolean;
  processed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  created: number;
  updated: number;
}

export default function BulkClientUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/clients/bulk-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (result: UploadResult) => {
      setUploadResult(result);
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Upload Complete",
        description: `Processed ${result.processed} rows. Created ${result.created} clients, updated ${result.updated} clients.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "There was an error processing your file. Please check the format and try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      await uploadMutation.mutateAsync(selectedFile);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/bulk-client-upload-template.csv';
    link.download = 'aloha-bail-bond-client-template.csv';
    link.click();
  };

  const downloadInstructions = () => {
    const link = document.createElement('a');
    link.href = '/templates/bulk-client-upload-instructions.txt';
    link.download = 'upload-instructions.txt';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bulk Client Upload</h2>
          <p className="text-muted-foreground">
            Upload multiple clients at once using a CSV file
          </p>
        </div>
      </div>

      {/* Template Downloads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Template & Instructions
          </CardTitle>
          <CardDescription>
            Download the CSV template and instructions before uploading your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={downloadTemplate} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
            <Button onClick={downloadInstructions} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Download Instructions
            </Button>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please download and review the template and instructions before uploading your data. 
              The CSV must include all required fields in the correct format.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Client Data
          </CardTitle>
          <CardDescription>
            Select your CSV file containing client data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
          </div>

          {selectedFile && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <Badge variant="secondary">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </Badge>
              </div>
              <Button 
                onClick={handleUpload} 
                disabled={isProcessing}
                className="ml-4"
              >
                {isProcessing ? "Processing..." : "Upload & Process"}
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Processing your file...</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{uploadResult.processed}</div>
                <div className="text-sm text-blue-600">Rows Processed</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{uploadResult.created}</div>
                <div className="text-sm text-green-600">Clients Created</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{uploadResult.updated}</div>
                <div className="text-sm text-yellow-600">Clients Updated</div>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600">Errors Found:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {uploadResult.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertDescription>
                        Row {error.row}, {error.field}: {error.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {uploadResult.success && uploadResult.errors.length === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All clients have been successfully processed with no errors.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}