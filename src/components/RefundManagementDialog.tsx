import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface RefundManagementDialogProps {
  order: {
    id: string;
    cancellation_reason: string;
    total_amount: number;
    refund_status: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const RefundManagementDialog = ({
  order,
  open,
  onOpenChange,
  onSuccess,
}: RefundManagementDialogProps) => {
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          refund_status: 'approved',
          seller_notes: adminNotes || 'Refund approved',
        })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Refund approved",
        description: "The refund has been approved. Process the payment externally.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error approving refund",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          refund_status: 'rejected',
          seller_notes: adminNotes,
          status: 'processing', // Revert to processing
        })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Refund rejected",
        description: "The customer has been notified of the rejection reason.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error rejecting refund",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Refund Request</DialogTitle>
          <DialogDescription>
            Review the cancellation request and decide whether to approve or reject the refund.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Order Total</Label>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(order.total_amount)}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cancellation Reason</Label>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-foreground">{order.cancellation_reason}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Current Status</Label>
            <Badge variant="secondary">{order.refund_status}</Badge>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-notes">
              {order.refund_status === 'requested' ? 'Notes (optional for approval, required for rejection)' : 'Admin Notes'}
            </Label>
            <Textarea
              id="admin-notes"
              placeholder="Add any notes about this refund decision..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            variant="default"
            onClick={handleApprove}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundManagementDialog;
