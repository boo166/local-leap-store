import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface StoreReview {
  id: string;
  store_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  review_images: string[];
  helpful_count: number;
  is_approved: boolean;
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useStoreReviews = (storeId: string | undefined) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<StoreReview | null>(null);

  const fetchReviews = async () => {
    if (!storeId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_reviews')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('store_id', storeId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data as StoreReview[]);

      // Check if user has already reviewed
      if (user) {
        const userReviewData = data?.find((r: any) => r.user_id === user.id);
        setUserReview(userReviewData ? userReviewData as StoreReview : null);
      }
    } catch (error: any) {
      console.error('Error fetching store reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (rating: number, reviewText: string, imageUrls: string[] = []) => {
    if (!user || !storeId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to leave a review.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('store_reviews')
        .insert({
          store_id: storeId,
          user_id: user.id,
          rating,
          review_text: reviewText,
          review_images: imageUrls,
          verified_purchase: true,
        });

      if (error) throw error;

      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback!',
      });

      await fetchReviews();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateReview = async (reviewId: string, rating: number, reviewText: string, imageUrls: string[] = []) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('store_reviews')
        .update({
          rating,
          review_text: reviewText,
          review_images: imageUrls,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Review updated',
        description: 'Your review has been updated successfully.',
      });

      await fetchReviews();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update review.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('store_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Review deleted',
        description: 'Your review has been removed.',
      });

      await fetchReviews();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete review.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [storeId, user]);

  return {
    reviews,
    userReview,
    loading,
    submitReview,
    updateReview,
    deleteReview,
    refetch: fetchReviews,
  };
};
