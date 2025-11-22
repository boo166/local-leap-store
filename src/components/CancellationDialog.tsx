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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CancellationDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CANCELLATION_REASONS = [
  'Changed my mind',
  'Found a better price elsewhere',
  'Ordered by mistake',
  'Delivery time too long',
  'Product no longer needed',
  'Other',
];

const CancellationDialog = ({
  orderId,
  open,
  onOpenChange,
  onSuccess,
}: CancellationDialogProps) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    
    if (!reason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for cancellation.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          refund_status: 'requested',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Cancellation requested",
        description: "Your order cancellation has been submitted. We'll process your refund soon.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error requesting cancellation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            Please let us know why you're cancelling this order. This helps us improve our service.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Reason for cancellation</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {CANCELLATION_REASONS.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason} id={reason} />
                  <Label htmlFor={reason} className="font-normal cursor-pointer">
                    {reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === 'Other' && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Please specify</Label>
              <Textarea
                id="custom-reason"
                placeholder="Tell us more about why you're cancelling..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Keep Order
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={submitting || !selectedReason}
          >
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Cancel Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancellationDialog;
