import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Search, User, DollarSign, Calendar, FileText, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  id: string;
  type: 'client' | 'payment' | 'court' | 'document';
  title: string;
  subtitle?: string;
  status?: string;
  url: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults = [] } = useQuery<SearchResult[]>({
    queryKey: ["/api/search/global", searchQuery],
    enabled: searchQuery.length >= 2,
  });

  const handleSelect = useCallback((url: string) => {
    onOpenChange(false);
    setSearchQuery("");
    setLocation(url);
  }, [onOpenChange, setLocation]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return <User className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'court':
        return <Calendar className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'client': return 'Client';
      case 'payment': return 'Payment';
      case 'court': return 'Court Date';
      case 'document': return 'Document';
      default: return '';
    }
  };

  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <Command className="rounded-lg border-0">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search clients, payments, court dates, documents..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="border-0 focus:ring-0"
            />
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">ESC</span>
            </kbd>
          </div>
          <CommandList className="max-h-[400px]">
            {searchQuery.length < 2 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search...
                <div className="mt-4 text-xs">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
                    Ctrl+K
                  </kbd>
                  {' '}to open search
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <>
                {Object.entries(groupedResults).map(([type, results]) => (
                  <CommandGroup key={type} heading={getTypeLabel(type as SearchResult['type']) + 's'}>
                    {results.map((result) => (
                      <CommandItem
                        key={result.id}
                        value={result.id}
                        onSelect={() => handleSelect(result.url)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                            {getIcon(result.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{result.title}</div>
                            {result.subtitle && (
                              <div className="text-xs text-muted-foreground">{result.subtitle}</div>
                            )}
                          </div>
                          {result.status && (
                            <Badge variant={
                              result.status === 'overdue' ? 'destructive' : 
                              result.status === 'pending' ? 'default' : 
                              'secondary'
                            }>
                              {result.status}
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
