import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, Check, X, Eye, ExternalLink, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Verification {
  id: string;
  store_id: string;
  verification_type: string;
  status: string;
  business_documents: any[];
  submitted_at: string;
  admin_notes: string | null;
  stores: {
    name: string;
    user_id: string;
    profiles: {
      full_name: string;
      email: string;
    };
  };
}

const StoreVerificationManager: React.FC = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [badgeType, setBadgeType] = useState('verified');
  const { toast } = useToast();

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_verifications')
        .select(`
          *,
          stores!store_verifications_store_id_fkey(
            name,
            user_id,
            profiles!stores_user_id_fkey(full_name, email)
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setVerifications(data as Verification[] || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching verifications',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (verification: Verification) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('Not authenticated');

      // Update verification status
      const { error: verificationError } = await supabase
        .from('store_verifications')
        .update({
          status: 'approved',
          reviewed_by: authData.user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        })
        .eq('id', verification.id);

      if (verificationError) throw verificationError;

      // Update store verification status
      const { error: storeError } = await supabase
        .from('stores')
        .update({
          is_verified: true,
          verification_badge: badgeType,
        })
        .eq('id', verification.store_id);

      if (storeError) throw storeError;

      toast({
        title: 'Verification approved',
        description: 'Store has been verified successfully.',
      });

      setSelectedVerification(null);
      setAdminNotes('');
      fetchVerifications();
    } catch (error: any) {
      toast({
        title: 'Error approving verification',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const rejectVerification = async (verification: Verification) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('store_verifications')
        .update({
          status: 'rejected',
          reviewed_by: authData.user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes,
        })
        .eq('id', verification.id);

      if (error) throw error;

      toast({
        title: 'Verification rejected',
        description: 'Store owner has been notified.',
      });

      setSelectedVerification(null);
      setAdminNotes('');
      fetchVerifications();
    } catch (error: any) {
      toast({
        title: 'Error rejecting verification',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Store Verifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = verifications.filter(v => v.status === 'pending').length;

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Store Verifications
            </div>
            {pendingCount > 0 && (
              <Badge variant="secondary">{pendingCount} pending</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No verification requests yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell className="font-medium">
                      {verification.stores?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{verification.stores?.profiles?.full_name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">
                          {verification.stores?.profiles?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{verification.verification_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {Array.isArray(verification.business_documents) 
                          ? verification.business_documents.length 
                          : 0} files
                      </div>
                    </TableCell>
                    <TableCell>
                      {verification.submitted_at 
                        ? format(new Date(verification.submitted_at), 'MMM d, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{getStatusBadge(verification.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVerification(verification)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
            <DialogDescription>
              Review the submitted documents and approve or reject this verification request.
            </DialogDescription>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Store Name</Label>
                  <p className="font-medium">{selectedVerification.stores?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Owner</Label>
                  <p className="font-medium">
                    {selectedVerification.stores?.profiles?.full_name}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Verification Type</Label>
                  <p className="font-medium">{selectedVerification.verification_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{getStatusBadge(selectedVerification.status)}</p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <Label className="text-muted-foreground">Submitted Documents</Label>
                <div className="mt-2 space-y-2">
                  {Array.isArray(selectedVerification.business_documents) && 
                    selectedVerification.business_documents.map((doc: any, index: number) => (
                      <a
                        key={index}
                        href={typeof doc === 'string' ? doc : doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Document {index + 1}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                </div>
              </div>

              {selectedVerification.status === 'pending' && (
                <>
                  <div>
                    <Label htmlFor="badge-type">Verification Badge Type</Label>
                    <Select value={badgeType} onValueChange={setBadgeType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="trusted">Trusted Seller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="admin-notes">Admin Notes</Label>
                    <Textarea
                      id="admin-notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this verification..."
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedVerification?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => rejectVerification(selectedVerification)}
                  className="text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button onClick={() => approveVerification(selectedVerification)}>
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </>
            )}
            {selectedVerification?.status !== 'pending' && (
              <Button variant="outline" onClick={() => setSelectedVerification(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StoreVerificationManager;
