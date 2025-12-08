import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Activity, Search, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_category: string;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  metadata: any;
  profiles?: {
    full_name: string;
    email: string;
  };
}

const UserActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select(`
          *,
          profiles!user_activity_logs_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setLogs(data || []);

      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(log => log.activity_category) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || log.activity_category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'auth':
        return 'bg-blue-500/10 text-blue-500';
      case 'order':
        return 'bg-green-500/10 text-green-500';
      case 'store':
        return 'bg-purple-500/10 text-purple-500';
      case 'product':
        return 'bg-indigo-500/10 text-indigo-500';
      case 'payment':
        return 'bg-amber-500/10 text-amber-500';
      case 'security':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Activity Log
            </CardTitle>
            <CardDescription>Monitor user actions across the platform</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activity Table */}
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {log.profiles?.full_name || 'Unknown'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.profiles?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(log.activity_category)}>
                      {log.activity_category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{log.activity_type}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground max-w-[200px] truncate block">
                      {log.description}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono">
                      {log.ip_address || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'MMM d, HH:mm')}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {filteredLogs.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No activity logs found
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UserActivityLog;
