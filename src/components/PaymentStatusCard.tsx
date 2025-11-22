import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentSubmission {
  id: string;
  amount: number;
  billing_cycle: string;
  transaction_id: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  subscription_plans: {
    name: string;
    currency: string;
  };
}

const PaymentStatusCard = () => {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentSubmissions();
  }, [user]);

  const fetchPaymentSubmissions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('payment_submissions')
        .select(`
          *,
          subscription_plans(name, currency)
        `)
        .eq('user_id', user.id)
        .in('status', ['pending', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading payment status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading || submissions.length === 0) return null;

  return (
    <Card className="glass-card mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Payment Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {submissions.map((submission) => (
          <Alert key={submission.id} className={
            submission.status === 'rejected' 
              ? 'border-red-500/50 bg-red-500/10'
              : 'border-yellow-500/50 bg-yellow-500/10'
          }>
            <div className="flex items-start gap-3">
              {getStatusIcon(submission.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">
                    {submission.subscription_plans.name} - {submission.billing_cycle}
                  </h4>
                  {getStatusBadge(submission.status)}
                </div>
                <AlertDescription>
                  <p className="text-sm mb-1">
                    Amount: {submission.amount} {submission.subscription_plans.currency}
                  </p>
                  <p className="text-sm mb-1">
                    Transaction ID: <code className="text-xs">{submission.transaction_id}</code>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted on {new Date(submission.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {submission.status === 'pending' && (
                    <p className="text-sm mt-2 text-yellow-600">
                      Your payment is being reviewed. You'll be notified once approved.
                    </p>
                  )}
                  {submission.status === 'rejected' && submission.admin_notes && (
                    <p className="text-sm mt-2 text-red-600">
                      Reason: {submission.admin_notes}
                    </p>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};

export default PaymentStatusCard;
