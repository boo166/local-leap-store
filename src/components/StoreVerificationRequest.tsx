import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useStoreVerification } from '@/hooks/useStoreVerification';
import { ShieldCheck, Award, Crown, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface StoreVerificationRequestProps {
  storeId: string;
}

const StoreVerificationRequest: React.FC<StoreVerificationRequestProps> = ({ storeId }) => {
  const { verification, loading, submitVerification } = useStoreVerification(storeId);
  const [selectedType, setSelectedType] = useState<'basic' | 'premium' | 'enterprise'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verificationTypes = [
    {
      value: 'basic',
      icon: ShieldCheck,
      label: 'Basic Verification',
      description: 'Verify your business identity',
      features: ['Business registration check', 'Identity verification', 'Basic trust badge'],
    },
    {
      value: 'premium',
      icon: Award,
      label: 'Premium Verification',
      description: 'Enhanced verification with premium features',
      features: ['All Basic features', 'Business document verification', 'Premium trust badge', 'Priority support'],
    },
    {
      value: 'enterprise',
      icon: Crown,
      label: 'Enterprise Verification',
      description: 'Full verification for large businesses',
      features: ['All Premium features', 'Dedicated account manager', 'Enterprise trust badge', 'Custom verification'],
    },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await submitVerification(selectedType);
    setIsSubmitting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive', label: string }> = {
      pending: { variant: 'secondary', label: 'Under Review' },
      approved: { variant: 'default', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
    };
    
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card className="glass border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse text-muted-foreground">Loading verification status...</div>
        </CardContent>
      </Card>
    );
  }

  // If already verified
  if (verification?.status === 'approved') {
    return (
      <Card className="glass border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <CardTitle>Store Verified</CardTitle>
                <CardDescription>Your store has been successfully verified</CardDescription>
              </div>
            </div>
            {getStatusBadge(verification.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-primary/20 rounded-lg">
              <div>
                <p className="font-medium">Verification Type</p>
                <p className="text-sm text-muted-foreground capitalize">{verification.verification_type}</p>
              </div>
              <div>
                <p className="font-medium">Verified On</p>
                <p className="text-sm text-muted-foreground">
                  {verification.reviewed_at ? format(new Date(verification.reviewed_at), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
            {verification.expires_at && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your verification expires on {format(new Date(verification.expires_at), 'MMM dd, yyyy')}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If verification is pending
  if (verification?.status === 'pending') {
    return (
      <Card className="glass border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <CardTitle>Verification Under Review</CardTitle>
                <CardDescription>Your verification request is being reviewed by our team</CardDescription>
              </div>
            </div>
            {getStatusBadge(verification.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Verification Type</p>
                <p className="text-sm text-muted-foreground capitalize">{verification.verification_type}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium">Submitted</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(verification.submitted_at), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <Alert>
              <AlertDescription>
                We typically review verification requests within 2-3 business days. You'll be notified once a decision is made.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If rejected
  if (verification?.status === 'rejected') {
    return (
      <Card className="glass border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <CardTitle>Verification Rejected</CardTitle>
                <CardDescription>Your verification request was not approved</CardDescription>
              </div>
            </div>
            {getStatusBadge(verification.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verification.admin_notes && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Reason:</strong> {verification.admin_notes}
                </AlertDescription>
              </Alert>
            )}
            <Button onClick={() => window.location.reload()} className="w-full">
              Submit New Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // New verification request form
  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle>Get Your Store Verified</CardTitle>
        <CardDescription>
          Boost customer trust with a verification badge
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
          <div className="space-y-4">
            {verificationTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.value} className="relative">
                  <RadioGroupItem
                    value={type.value}
                    id={type.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={type.value}
                    className="flex items-start gap-4 p-4 border-2 border-primary/20 rounded-lg cursor-pointer hover:bg-primary/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-1">{type.label}</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        {type.description}
                      </div>
                      <ul className="space-y-1">
                        {type.features.map((feature, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>

        <Alert>
          <AlertDescription>
            Verification helps build trust with customers and can increase your sales by up to 40%.
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Verification Request'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StoreVerificationRequest;
