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
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setScreenshotFile(file);
      setScreenshotUrl(''); // Clear URL if file is selected
    }
  };

  const uploadScreenshot = async (): Promise<string | null> => {
    if (!screenshotFile || !user) return null;

    setUploading(true);
    try {
      const fileExt = screenshotFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, screenshotFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide transaction ID",
        variant: "destructive",
      });
      return;
    }

    if (!screenshotFile && !screenshotUrl.trim()) {
      toast({
        title: "Missing screenshot",
        description: "Please upload a screenshot or provide a URL",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Upload file if provided
      let finalScreenshotUrl = screenshotUrl.trim();
      if (screenshotFile) {
        const uploadedUrl = await uploadScreenshot();
        if (!uploadedUrl) {
          setSubmitting(false);
          return;
        }
        finalScreenshotUrl = uploadedUrl;
      }
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
          screenshot_url: finalScreenshotUrl,
          status: 'pending',
        });

      if (paymentError) throw paymentError;

      toast({
        title: "Payment submitted successfully",
        description: "Your payment is being reviewed. You'll be notified once approved.",
      });

      setTransactionId('');
      setScreenshotUrl('');
      setScreenshotFile(null);
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
            <Label htmlFor="screenshot">Payment Screenshot *</Label>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="screenshot-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={submitting || uploading}
                />
                <label
                  htmlFor="screenshot-file"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {screenshotFile ? screenshotFile.name : 'Click to upload screenshot'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or paste URL
                  </span>
                </div>
              </div>

              <Input
                id="screenshot-url"
                type="url"
                value={screenshotUrl}
                onChange={(e) => {
                  setScreenshotUrl(e.target.value);
                  if (e.target.value) setScreenshotFile(null);
                }}
                placeholder="https://example.com/screenshot.jpg"
                disabled={!!screenshotFile || submitting}
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Payment Instructions:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Send {price} {plan.currency} to Vodafone Cash: <strong className="text-foreground">01234567890</strong></li>
              <li>Take a clear screenshot of the payment confirmation</li>
              <li>Upload the screenshot above or paste image URL</li>
              <li>Enter the transaction ID and submit</li>
            </ol>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting || uploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="apple"
              disabled={submitting || uploading}
              className="flex-1"
            >
              {submitting || uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploading ? 'Uploading...' : 'Submitting...'}
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
