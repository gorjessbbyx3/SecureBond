import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Server, Database, Activity, Settings, LogOut, AlertTriangle, CheckCircle, Terminal, Power, Wifi } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export default function MaintenanceDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  
  // SSH Terminal State
  const [sshConnected, setSshConnected] = useState(false);
  const [sshHost, setSshHost] = useState("aloha-bail-bond-server");
  const [sshOutput, setSshOutput] = useState<string[]>([
    "SSH Terminal - Aloha Bail Bond Server",
    "Ready to connect...",
    ""
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // SSH Terminal Functions
  const connectSSH = () => {
    setSshConnected(true);
    setSshOutput(prev => [
      ...prev,
      `$ ssh maintenance@${sshHost}`,
      "Connecting to Aloha Bail Bond Server...",
      "Authentication successful.",
      `maintenance@${sshHost}:~$ `,
      ""
    ]);
    toast({
      title: "SSH Connected",
      description: `Connected to ${sshHost}`,
    });
  };

  const disconnectSSH = () => {
    setSshConnected(false);
    setSshOutput(prev => [
      ...prev,
      "Connection to server closed.",
      "",
      "SSH Terminal - Aloha Bail Bond Server",
      "Ready to connect...",
      ""
    ]);
    toast({
      title: "SSH Disconnected",
      description: "Connection closed",
    });
  };

  const executeCommand = (command: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSshOutput(prev => [
      ...prev,
      `maintenance@${sshHost}:~$ ${command}`,
      ...simulateCommandOutput(command),
      `maintenance@${sshHost}:~$ `,
      ""
    ]);
  };

  const simulateCommandOutput = (command: string): string[] => {
    const cmd = command.toLowerCase().trim();
    
    if (cmd === 'ls' || cmd === 'ls -la') {
      return [
        "total 48",
        "drwxr-xr-x 8 maintenance maintenance 4096 Jan 10 15:30 .",
        "drwxr-xr-x 3 root       root       4096 Jan  1 12:00 ..",
        "-rw-r--r-- 1 maintenance maintenance  220 Jan  1 12:00 .bash_logout",
        "-rw-r--r-- 1 maintenance maintenance 3526 Jan  1 12:00 .bashrc",
        "drwxr-xr-x 2 maintenance maintenance 4096 Jan 10 15:30 aloha-bail-bond",
        "drwxr-xr-x 2 maintenance maintenance 4096 Jan 10 14:00 backups",
        "drwxr-xr-x 2 maintenance maintenance 4096 Jan 10 15:25 logs",
        "-rw-r--r-- 1 maintenance maintenance  807 Jan  1 12:00 .profile"
      ];
    }
    
    if (cmd === 'ps aux' || cmd === 'ps') {
      return [
        "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND",
        "root         1  0.0  0.1  225676  4824 ?        Ss   14:30   0:01 /sbin/init",
        "root        87  0.0  0.3  105996 12440 ?        S<s  14:30   0:00 /lib/systemd/systemd-udevd",
        "maint      1234  2.1 15.4  987654 125000 ?      Sl   14:35   0:45 node /app/server/index.js",
        "postgres   5678  0.8  8.2  445566 67890 ?       Ss   14:30   0:12 postgres: main process",
        "nginx      9012  0.2  1.1  123456 8901 ?        S    14:30   0:03 nginx: worker process"
      ];
    }
    
    if (cmd === 'df -h' || cmd === 'df') {
      return [
        "Filesystem      Size  Used Avail Use% Mounted on",
        "/dev/sda1        20G  8.5G   11G  45% /",
        "/dev/sda2       100G   45G   50G  48% /var",
        "tmpfs           2.0G     0  2.0G   0% /dev/shm",
        "/dev/sda3        50G   12G   36G  25% /home"
      ];
    }
    
    if (cmd === 'free -h' || cmd === 'free') {
      return [
        "               total        used        free      shared  buff/cache   available",
        "Mem:           7.8Gi       2.1Gi       3.2Gi       245Mi       2.5Gi       5.2Gi",
        "Swap:          2.0Gi          0B       2.0Gi"
      ];
    }
    
    if (cmd === 'systemctl status nginx' || cmd.includes('nginx')) {
      return [
        "● nginx.service - A high performance web server and a reverse proxy server",
        "   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)",
        "   Active: active (running) since Wed 2024-01-10 14:30:15 UTC; 1h 15min ago",
        "     Docs: man:nginx(8)",
        "  Process: 1234 ExecStartPre=/usr/sbin/nginx -t -q -g daemon on; master_process on; (code=exited, status=0/SUCCESS)",
        "  Process: 1235 ExecStart=/usr/sbin/nginx -g daemon on; master_process on; (code=exited, status=0/SUCCESS)",
        " Main PID: 1236 (nginx)",
        "    Tasks: 3 (limit: 4915)",
        "   Memory: 15.2M",
        "   CGroup: /system.slice/nginx.service",
        "           ├─1236 nginx: master process /usr/sbin/nginx -g daemon on; master_process on;",
        "           ├─1237 nginx: worker process",
        "           └─1238 nginx: worker process"
      ];
    }
    
    if (cmd === 'tail -f /var/log/aloha-bail-bond/app.log' || cmd.includes('tail')) {
      return [
        "[2024-01-10 15:45:12] INFO: Client check-in recorded - SB123456",
        "[2024-01-10 15:44:33] INFO: Payment processed successfully - $750.00",
        "[2024-01-10 15:43:55] INFO: Court date reminder sent - SB789012",
        "[2024-01-10 15:43:22] INFO: Database backup completed",
        "[2024-01-10 15:42:18] WARN: High memory usage detected - 87%",
        "[2024-01-10 15:41:45] INFO: New client registration - SB345678",
        "^C (Use Ctrl+C to stop tail)"
      ];
    }
    
    if (cmd === 'uptime') {
      return [
        "15:46:23 up 1 day, 1:16, 2 users, load average: 0.45, 0.38, 0.42"
      ];
    }
    
    if (cmd === 'whoami') {
      return ["maintenance"];
    }
    
    if (cmd === 'pwd') {
      return ["/home/maintenance"];
    }
    
    if (cmd.startsWith('cd ')) {
      return [`Changed directory to ${cmd.substring(3)}`];
    }
    
    if (cmd === 'clear') {
      return [];
    }
    
    if (cmd === 'help' || cmd === '--help') {
      return [
        "Available commands:",
        "  ls, ls -la     - List directory contents",
        "  ps aux         - Show running processes",
        "  df -h          - Show disk space usage",
        "  free -h        - Show memory usage",
        "  systemctl status nginx - Check nginx status",
        "  tail -f /var/log/aloha-bail-bond/app.log - View application logs",
        "  uptime         - Show system uptime",
        "  whoami         - Show current user",
        "  pwd            - Show current directory",
        "  clear          - Clear terminal",
        "  help           - Show this help message"
      ];
    }
    
    return [`bash: ${command}: command not found`];
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sshConnected || !currentCommand.trim()) return;
    
    if (currentCommand.toLowerCase().trim() === 'clear') {
      setSshOutput([
        `maintenance@${sshHost}:~$ `,
        ""
      ]);
    } else {
      executeCommand(currentCommand);
    }
    
    setCurrentCommand("");
  };

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [sshOutput]);

  // Focus input when SSH tab is active
  useEffect(() => {
    if (activeTab === "ssh" && sshConnected && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeTab, sshConnected]);

  // Mock system stats
  const systemStats = {
    serverStatus: "operational",
    databaseStatus: "operational",
    lastBackup: "2024-01-10T02:00:00Z",
    uptime: "99.9%",
    activeUsers: 15,
    storageUsed: "45%",
  };

  const getStatusBadge = (status: string) => {
    if (status === "operational") {
      return <Badge className="bg-green-100 text-green-800">Operational</Badge>;
    }
    return <Badge variant="destructive">Down</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Maintenance Portal" subtitle="System Administration" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">System Maintenance</h1>
            <p className="text-slate-600">Monitor and maintain system operations</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center">
            <LogOut className="mr-2 w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Server className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Server Status</p>
                  <div className="mt-1">
                    {getStatusBadge(systemStats.serverStatus)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Database Status</p>
                  <div className="mt-1">
                    {getStatusBadge(systemStats.databaseStatus)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">System Uptime</p>
                  <p className="text-2xl font-bold text-slate-900">{systemStats.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active Users</p>
                  <p className="text-2xl font-bold text-slate-900">{systemStats.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="logs">System Logs</TabsTrigger>
            <TabsTrigger value="ssh">SSH Terminal</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Server Response Time</span>
                    <Badge className="bg-green-100 text-green-800">Good</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memory Usage</span>
                    <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <span className="text-sm text-slate-600">{systemStats.storageUsed}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Maintenance */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Maintenance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Database backup completed</p>
                        <p className="text-xs text-slate-500">
                          {new Date(systemStats.lastBackup).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Security updates applied</p>
                        <p className="text-xs text-slate-500">January 8, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">Scheduled maintenance</p>
                        <p className="text-xs text-slate-500">January 15, 2024 - 2:00 AM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                  <div>[2024-01-10 14:30:15] INFO: Client login successful - User: SB123456</div>
                  <div>[2024-01-10 14:29:42] INFO: Payment processed - Amount: $500.00</div>
                  <div>[2024-01-10 14:28:33] INFO: Database backup initiated</div>
                  <div>[2024-01-10 14:25:12] INFO: Check-in recorded - Client: SB789012</div>
                  <div>[2024-01-10 14:20:05] WARN: High memory usage detected - 85%</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ssh">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Terminal className="mr-2 w-5 h-5" />
                    SSH Terminal
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={sshConnected ? "default" : "secondary"} className="flex items-center space-x-1">
                      <Wifi className="w-3 h-3" />
                      <span>{sshConnected ? "Connected" : "Disconnected"}</span>
                    </Badge>
                    {sshConnected ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={disconnectSSH}
                        className="flex items-center space-x-1"
                      >
                        <Power className="w-3 h-3" />
                        <span>Disconnect</span>
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={connectSSH}
                        className="flex items-center space-x-1"
                      >
                        <Terminal className="w-3 h-3" />
                        <span>Connect</span>
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Terminal Output */}
                <div 
                  ref={terminalRef}
                  className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto mb-4 whitespace-pre-wrap"
                >
                  {sshOutput.map((line, index) => (
                    <div key={index} className={line.startsWith('maintenance@') ? 'text-blue-400' : ''}>
                      {line}
                    </div>
                  ))}
                </div>

                {/* Command Input */}
                {sshConnected && (
                  <form onSubmit={handleCommandSubmit} className="flex space-x-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 font-mono text-sm">
                        maintenance@{sshHost}:~$
                      </span>
                      <Input
                        ref={inputRef}
                        value={currentCommand}
                        onChange={(e) => setCurrentCommand(e.target.value)}
                        placeholder="Enter command..."
                        className="pl-48 font-mono text-sm bg-slate-800 border-slate-700 text-green-400"
                        autoComplete="off"
                      />
                    </div>
                    <Button type="submit" size="sm" disabled={!currentCommand.trim()}>
                      Execute
                    </Button>
                  </form>
                )}

                {/* Help Text */}
                {!sshConnected && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Click "Connect" to establish SSH connection to the Aloha Bail Bond server. 
                      Once connected, you can execute system commands for maintenance and monitoring.
                    </p>
                  </div>
                )}

                {sshConnected && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      SSH session active. Type "help" for available commands. Use "clear" to clear the terminal.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backups">
            <Card>
              <CardHeader>
                <CardTitle>Database Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Daily Backup</p>
                      <p className="text-sm text-slate-500">
                        Last run: {new Date(systemStats.lastBackup).toLocaleString()}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Success</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Weekly Backup</p>
                      <p className="text-sm text-slate-500">Last run: January 7, 2024</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Success</Badge>
                  </div>
                  <Button className="w-full">
                    <Database className="mr-2 w-4 h-4" />
                    Create Manual Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 w-4 h-4" />
                    Configure Email Notifications
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="mr-2 w-4 h-4" />
                    Database Maintenance
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="mr-2 w-4 h-4" />
                    Performance Monitoring
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
