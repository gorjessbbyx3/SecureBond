import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, HardDrive, Shield, RefreshCw, Calendar, FileText, Database } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DataManagement() {
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: storageInfo } = useQuery({
    queryKey: ['/api/data/storage-info'],
  });

  const exportDataMutation = useMutation({
    mutationFn: async (type: string) => {
      const response = await apiRequest("POST", "/api/data/export", { type });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Export completed",
        description: `Data exported successfully to: ${data.path}`,
      });
    },
  });

  const backupDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/data/backup");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data/storage-info'] });
      toast({
        title: "Backup created",
        description: "Manual backup has been created successfully",
      });
    },
  });

  const cleanupDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/data/cleanup");
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/data/storage-info'] });
      toast({
        title: "Cleanup completed",
        description: "Old backup files have been removed",
      });
    },
  });

  const mockStorageInfo = {
    dataDirectory: "C:\\Users\\Bondsman\\Documents\\SecureBond Data",
    totalSize: "45.2 MB",
    lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    backupCount: 7,
    files: {
      clients: { count: 24, size: "12.4 MB" },
      payments: { count: 156, size: "8.7 MB" },
      checkins: { count: 892, size: "15.2 MB" },
      expenses: { count: 43, size: "2.1 MB" },
      alerts: { count: 12, size: "0.8 MB" }
    }
  };

  const info = storageInfo || mockStorageInfo;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Local Data Storage
          </CardTitle>
          <CardDescription>
            Your data is stored locally on this computer for complete privacy and control
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span className="font-medium">Storage Location</span>
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                {info.dataDirectory}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Data Size</span>
              </div>
              <p className="text-sm">
                {info.totalSize} of client data stored locally
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {Object.entries(info.files).map(([type, data]) => (
              <div key={type} className="p-3 border rounded-lg">
                <div className="text-sm font-medium capitalize">{type}</div>
                <div className="text-xs text-muted-foreground">
                  {data.count} records
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.size}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Export your data in various formats for reporting or external use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  onClick={() => exportDataMutation.mutate('clients')}
                  disabled={exportDataMutation.isPending}
                  className="h-16 flex-col gap-2"
                >
                  <FileText className="h-6 w-6" />
                  Export Client List
                  <span className="text-xs">CSV format</span>
                </Button>

                <Button
                  onClick={() => exportDataMutation.mutate('payments')}
                  disabled={exportDataMutation.isPending}
                  className="h-16 flex-col gap-2"
                  variant="outline"
                >
                  <Download className="h-6 w-6" />
                  Export Payments
                  <span className="text-xs">For accounting</span>
                </Button>

                <Button
                  onClick={() => exportDataMutation.mutate('financial')}
                  disabled={exportDataMutation.isPending}
                  className="h-16 flex-col gap-2"
                  variant="outline"
                >
                  <Calendar className="h-6 w-6" />
                  Financial Report
                  <span className="text-xs">Monthly summary</span>
                </Button>

                <Button
                  onClick={() => exportDataMutation.mutate('complete')}
                  disabled={exportDataMutation.isPending}
                  className="h-16 flex-col gap-2"
                  variant="outline"
                >
                  <Database className="h-6 w-6" />
                  Complete Export
                  <span className="text-xs">All data</span>
                </Button>
              </div>

              {exportDataMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Exporting data...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup Management</CardTitle>
              <CardDescription>
                Automatic daily backups keep your data safe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Last Backup</span>
                    <Badge variant="secondary">
                      {new Date(info.lastBackup).toLocaleDateString()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Backup Count</span>
                    <Badge variant="outline">
                      {info.backupCount} backups
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Auto Backup</span>
                    <Badge className="bg-green-100 text-green-800">
                      Enabled
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => backupDataMutation.mutate()}
                    disabled={backupDataMutation.isPending}
                    className="w-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Create Manual Backup
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Restore from Backup
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Backup Information
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Automatic backups run daily at midnight</li>
                  <li>• Last 10 backups are kept automatically</li>
                  <li>• Manual backups are created instantly</li>
                  <li>• Backups include all client and financial data</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Maintenance</CardTitle>
              <CardDescription>
                Keep your system running efficiently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  onClick={() => cleanupDataMutation.mutate()}
                  disabled={cleanupDataMutation.isPending}
                  variant="outline"
                  className="h-16 flex-col gap-2"
                >
                  <RefreshCw className="h-6 w-6" />
                  Cleanup Old Backups
                  <span className="text-xs">Free up space</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-16 flex-col gap-2"
                >
                  <HardDrive className="h-6 w-6" />
                  Optimize Database
                  <span className="text-xs">Improve performance</span>
                </Button>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                  Maintenance Tips
                </h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                  <li>• Run cleanup monthly to free disk space</li>
                  <li>• Monitor data folder size regularly</li>
                  <li>• Create manual backups before major updates</li>
                  <li>• Keep important backups on external storage</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}