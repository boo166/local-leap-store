import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Loader2 } from 'lucide-react';

interface PaymentSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    price_monthly: number;
    price_yearly: number;
    currency: string;
  };
  billingCycle: 'monthly' | 'yearly';
  onSuccess: () => void;
}

const PaymentSubmissionModal: React.FC<PaymentSubmissionModalProps> = ({
  open,
  onClose,
  plan,
  billingCycle,
  onSuccess,
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim() || !screenshotUrl.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both transaction ID and screenshot URL",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const amount = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;

      // Get or create subscription
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      let subscriptionId = existingSubscription?.id;

      if (!subscriptionId) {
        // Create a new subscription entry if it doesn't exist
        const { data: newSubscription, error: subError } = await supabase
          .from('user_subscriptions')
          .insert({
            user_id: user?.id,
            plan_id: plan.id,
            status: 'pending',
            billing_cycle: billingCycle,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + (billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (subError) throw subError;
        subscriptionId = newSubscription.id;
      }

      // Submit payment proof
      const { error: paymentError } = await supabase
        .from('payment_submissions')
        .insert({
          user_id: user?.id,
          subscription_id: subscriptionId,
          plan_id: plan.id,
          amount: amount,
          billing_cycle: billingCycle,
          transaction_id: transactionId.trim(),
          screenshot_url: screenshotUrl.trim(),
          status: 'pending',
        });

      if (paymentError) throw paymentError;

      toast({
        title: "Payment submitted successfully",
        description: "Your payment is being reviewed. You'll be notified once approved.",
      });

      setTransactionId('');
      setScreenshotUrl('');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Payment Proof</DialogTitle>
          <DialogDescription>
            Upgrading to {plan.name} - {price} {plan.currency}/{billingCycle === 'monthly' ? 'month' : 'year'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-id">Vodafone Cash Transaction ID</Label>
            <Input
              id="transaction-id"
              placeholder="e.g., VF123456789"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Enter the transaction ID from your Vodafone Cash payment
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot-url">Payment Screenshot URL</Label>
            <Input
              id="screenshot-url"
              type="url"
              placeholder="https://example.com/screenshot.jpg"
              value={screenshotUrl}
              onChange={(e) => setScreenshotUrl(e.target.value)}
              required
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Upload your screenshot to any image hosting service (e.g., Imgur, ImgBB) and paste the URL here
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Payment Instructions:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Send {price} {plan.currency} to Vodafone Cash: <strong className="text-foreground">01234567890</strong></li>
              <li>Take a clear screenshot of the payment confirmation</li>
              <li>Upload the screenshot to an image hosting service</li>
              <li>Paste the image URL and transaction ID above</li>
            </ol>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="apple"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSubmissionModal;
