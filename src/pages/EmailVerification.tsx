import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EmailVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailVerification = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (type === 'signup' && token) {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (error) {
            setVerificationStatus('error');
            toast({
              title: "Verification failed",
              description: error.message,
              variant: "destructive",
            });
          } else {
            setVerificationStatus('success');
            toast({
              title: "Email verified",
              description: "Your email has been successfully verified. You can now sign in.",
            });
          }
        } catch (error: any) {
          setVerificationStatus('error');
          toast({
            title: "Verification failed",
            description: "An error occurred while verifying your email.",
            variant: "destructive",
          });
        }
      } else {
        setVerificationStatus('error');
      }
    };

    handleEmailVerification();
  }, [searchParams, toast]);

  const resendVerificationEmail = async () => {
    try {
      // This would require the user's email, which we might not have in this context
      toast({
        title: "Resend not available",
        description: "Please sign up again to receive a new verification email.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resend verification email.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/auth')}
          className="glass text-foreground hover:bg-white/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sign In
        </Button>
      </div>

      <Card className="w-full max-w-md glass border-white/20">
        <div className="p-8 space-y-6">
          {verificationStatus === 'loading' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-apple rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Verifying Email
              </h1>
              <p className="text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Email Verified
              </h1>
              <p className="text-muted-foreground">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <Button
                onClick={() => navigate('/auth')}
                variant="apple"
                className="w-full"
              >
                Continue to Sign In
              </Button>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto">
                <X className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                Verification Failed
              </h1>
              <p className="text-muted-foreground">
                The verification link is invalid or has expired. Please try signing up again.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/auth')}
                  variant="apple"
                  className="w-full"
                >
                  Sign Up Again
                </Button>
                <Button
                  onClick={resendVerificationEmail}
                  variant="outline"
                  className="w-full glass border-white/20 hover:bg-white/20"
                >
                  Resend Verification Email
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmailVerification;