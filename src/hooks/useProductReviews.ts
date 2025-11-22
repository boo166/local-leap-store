import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  verified_purchase: boolean;
  helpful_count: number;
  is_approved: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

export const useProductReviews = (productId: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (productId) {
      fetchReviews();
      if (user) {
        checkUserReviewStatus();
        checkCanReview();
      }
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately for each review
      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', review.user_id)
            .maybeSingle();
          
          return {
            ...review,
            profiles: profile
          };
        })
      );

      setReviews(reviewsWithProfiles);
      calculateStats(reviewsWithProfiles);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData: Review[]) => {
    if (reviewsData.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
      return;
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviewsData.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
      totalRating += review.rating;
    });

    setStats({
      averageRating: totalRating / reviewsData.length,
      totalReviews: reviewsData.length,
      ratingDistribution: distribution,
    });
  };

  const checkUserReviewStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserHasReviewed(!!data);
    } catch (error: any) {
      console.error('Error checking review status:', error);
    }
  };

  const checkCanReview = async () => {
    if (!user) return;

    try {
      // Check if user has purchased and received this product
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          orders!inner(
            user_id,
            status
          )
        `)
        .eq('product_id', productId)
        .eq('orders.user_id', user.id)
        .in('orders.status', ['delivered', 'completed']);

      if (error) throw error;
      setCanReview(!!data && data.length > 0);
    } catch (error: any) {
      console.error('Error checking purchase status:', error);
    }
  };

  const submitReview = async (rating: number, reviewText: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert([
          {
            product_id: productId,
            user_id: user.id,
            rating,
            review_text: reviewText,
            verified_purchase: canReview,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      fetchReviews();
      checkUserReviewStatus();
    } catch (error: any) {
      toast({
        title: "Error submitting review",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markHelpful = async (reviewId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to vote.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('review_helpful_votes')
        .insert([{ review_id: reviewId, user_id: user.id }]);

      if (error) throw error;

      toast({
        title: "Thanks for your feedback!",
      });

      fetchReviews();
    } catch (error: any) {
      // If already voted, silently ignore
      if (error.code === '23505') {
        toast({
          title: "Already voted",
          description: "You've already marked this review as helpful.",
        });
      }
    }
  };

  return {
    reviews,
    stats,
    loading,
    userHasReviewed,
    canReview,
    submitReview,
    markHelpful,
    refetch: fetchReviews,
  };
};
