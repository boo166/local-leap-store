import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/StarRating';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Check, X, ShieldCheck, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  review_images?: any;
  verified_purchase: boolean;
  helpful_count: number;
  is_approved: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
  } | null;
  products?: {
    name: string;
  } | null;
}

const AdminReviewModeration = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('product_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch related data separately
      const enrichedReviews = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, email')
            .eq('user_id', review.user_id)
            .maybeSingle();

          const { data: product } = await supabase
            .from('products')
            .select('name')
            .eq('id', review.product_id)
            .maybeSingle();

          return {
            ...review,
            profiles: profile,
            products: product,
          };
        })
      );

      setReviews(enrichedReviews as Review[]);
    } catch (error: any) {
      toast({
        title: "Error loading reviews",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: true })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Review approved",
        description: "The review is now visible to customers.",
      });

      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error approving review",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const rejectReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: false })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Review rejected",
        description: "The review has been hidden from customers.",
      });

      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error rejecting review",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Review deleted",
        description: "The review has been permanently removed.",
      });

      fetchReviews();
    } catch (error: any) {
      toast({
        title: "Error deleting review",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const ReviewCard = ({ review }: { review: Review }) => (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={review.profiles?.avatar_url || undefined} />
            <AvatarFallback>
              {review.profiles?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">
                  {review.profiles?.full_name || 'Anonymous User'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {review.profiles?.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(review.created_at)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={review.is_approved ? 'default' : 'secondary'}>
                  {review.is_approved ? 'Approved' : 'Pending'}
                </Badge>
                {review.verified_purchase && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} size="sm" showNumber />
                <p className="text-sm text-muted-foreground">
                  Product: <span className="font-medium">{review.products?.name}</span>
                </p>
              </div>

              {review.review_text && (
                <p className="text-sm text-foreground leading-relaxed bg-muted/50 p-3 rounded-lg">
                  {review.review_text}
                </p>
              )}

              {review.review_images && (review.review_images as string[]).length > 0 && (
                <div className="flex gap-2 mt-3">
                  {(review.review_images as string[]).map((imageUrl, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <button className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Review image ${index + 1}`}
                            className="h-20 w-20 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity cursor-pointer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-white" />
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <img
                          src={imageUrl}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-auto rounded-lg"
                        />
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{review.helpful_count} people found this helpful</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {!review.is_approved ? (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => approveReview(review.id)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => rejectReview(review.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the review.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteReview(review.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto animate-bounce"></div>
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </div>
    );
  }

  const pendingReviews = reviews.filter(r => !r.is_approved);
  const approvedReviews = reviews.filter(r => r.is_approved);

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Review Moderation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-bold">{reviews.length}</p>
            </div>
            <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingReviews.length}</p>
            </div>
            <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{approvedReviews.length}</p>
            </div>
          </div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingReviews.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedReviews.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingReviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No pending reviews</p>
                </div>
              ) : (
                pendingReviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-6">
              {approvedReviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No approved reviews</p>
                </div>
              ) : (
                approvedReviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4 mt-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No reviews yet</p>
                </div>
              ) : (
                reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReviewModeration;
