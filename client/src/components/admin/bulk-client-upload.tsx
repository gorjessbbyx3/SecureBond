import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Upload, CheckCircle, AlertCircle, X } from "lucide-react";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await fetch('/api/clients/bulk-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (result: UploadResult) => {
      setUploadResult(result);
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      
      if (result.success) {
        toast({
          title: "Upload completed successfully",
          description: `Created ${result.created} clients, updated ${result.updated} clients`,
        });
      } else {
        toast({
          title: "Upload completed with errors",
          description: `${result.errors.length} errors found in your data`,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const isProcessing = uploadMutation.isPending;

  const downloadTemplate = () => {
    const csvContent = `firstName,lastName,email,phone,address,city,state,zipCode,dateOfBirth,emergencyContact,emergencyPhone
John,Doe,john.doe@email.com,555-0123,123 Main St,Honolulu,HI,96813,1990-01-15,Jane Doe,555-0124
Jane,Smith,jane.smith@email.com,555-0456,456 Oak Ave,Hilo,HI,96720,1985-05-20,John Smith,555-0457`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'client-upload-template.csv';
    link.click();
  };

  const downloadInstructions = () => {
    const instructions = `BULK CLIENT UPLOAD INSTRUCTIONS

Required Fields:
- firstName: Client's first name
- lastName: Client's last name  
- email: Valid email address
- phone: Phone number (any format)
- address: Street address
- city: City name
- state: State abbreviation (e.g., HI)
- zipCode: ZIP code
- dateOfBirth: Date in YYYY-MM-DD format
- emergencyContact: Emergency contact name
- emergencyPhone: Emergency contact phone

Optional Fields:
- All fields are required for this upload

Notes:
- Use CSV format only
- First row must contain column headers
- Date format must be YYYY-MM-DD  
- Phone numbers can be in any format
- Empty rows will be skipped
- Duplicate emails will update existing clients

File Size Limit: 10MB
Maximum Records: 1000 per upload`;

    const blob = new Blob([instructions], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'upload-instructions.txt';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Download Template */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
            1
          </div>
          <h4 className="font-medium">Download CSV Template</h4>
        </div>
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
      </div>

      {/* Step 2: Upload File */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
            2
          </div>
          <h4 className="font-medium">Upload Your CSV File</h4>
        </div>
        <div className="space-y-4">
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
                variant="outline"
                size="sm"
                onClick={handleUpload}
                disabled={isProcessing}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isProcessing ? 'Uploading...' : 'Upload'}
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
        </div>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <h4 className="font-medium">Upload Results</h4>
          </div>
          
          <div className="space-y-4">
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
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">
                      {uploadResult.errors.length} errors found:
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {uploadResult.errors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-sm">
                          Row {error.row}: {error.field} - {error.message}
                        </div>
                      ))}
                      {uploadResult.errors.length > 10 && (
                        <div className="text-sm font-medium">
                          ... and {uploadResult.errors.length - 10} more errors
                        </div>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {uploadResult.success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Upload completed successfully! All client data has been imported.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  );
}