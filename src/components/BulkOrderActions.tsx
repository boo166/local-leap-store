import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

interface BulkOrderActionsProps {
  orders: Order[];
  onUpdate: () => void;
}

const BulkOrderActions: React.FC<BulkOrderActionsProps> = ({ orders, onUpdate }) => {
  const { toast } = useToast();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered').map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleBulkUpdate = async () => {
    if (!newStatus || selectedOrders.length === 0) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', selectedOrders);

      if (error) throw error;

      toast({
        title: 'Orders updated',
        description: `${selectedOrders.length} orders have been updated to "${newStatus}"`,
      });
      
      setSelectedOrders([]);
      setNewStatus('');
      onUpdate();
    } catch (error: any) {
      toast({
        title: 'Error updating orders',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'processing': return <Package className="h-3 w-3" />;
      case 'shipped': return <Truck className="h-3 w-3" />;
      case 'delivered': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      default: return <Package className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const selectableOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'delivered');

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Bulk Actions</CardTitle>
            <CardDescription>Select orders to update in bulk</CardDescription>
          </div>
          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="New status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={!newStatus || loading}
                onClick={() => setConfirmOpen(true)}
              >
                Update {selectedOrders.length} orders
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Checkbox
              checked={selectableOrders.length > 0 && selectedOrders.length === selectableOrders.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedOrders.length > 0 
                ? `${selectedOrders.length} selected` 
                : 'Select all'}
            </span>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {orders.slice(0, 10).map((order) => {
              const isDisabled = order.status === 'cancelled' || order.status === 'delivered';
              return (
                <div
                  key={order.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    selectedOrders.includes(order.id) ? 'bg-primary/10' : 'bg-muted/30'
                  } ${isDisabled ? 'opacity-50' : ''}`}
                >
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                    disabled={isDisabled}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      #{order.id.slice(0, 8)} - {order.profiles?.full_name || order.profiles?.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-xs`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update {selectedOrders.length} orders to "{newStatus}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkUpdate} disabled={loading}>
              {loading ? 'Updating...' : 'Confirm Update'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default BulkOrderActions;
