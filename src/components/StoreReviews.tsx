import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useStoreReviews } from '@/hooks/useStoreReviews';
import { useAuth } from '@/contexts/AuthContext';
import { Star, ShieldCheck, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface StoreReviewsProps {
  storeId: string;
  storeName: string;
}

const StoreReviews: React.FC<StoreReviewsProps> = ({ storeId, storeName }) => {
  const { user } = useAuth();
  const { reviews, userReview, loading, submitReview, updateReview } = useStoreReviews(storeId);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const success = userReview
      ? await updateReview(userReview.id, rating, reviewText)
      : await submitReview(rating, reviewText);

    if (success) {
      setReviewText('');
      setRating(5);
      setShowForm(false);
    }
    setIsSubmitting(false);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    stars: star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <CardTitle>Store Reviews</CardTitle>
          <CardDescription>What customers are saying about {storeName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="flex flex-col items-center justify-center p-6 border border-primary/20 rounded-lg">
              <div className="text-5xl font-bold mb-2">{averageRating}</div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(Number(averageRating))
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm w-12">{stars} stars</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Button */}
          {user && !showForm && !userReview && (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full mt-6"
            >
              Write a Review
            </Button>
          )}

          {/* Review Form */}
          {user && (showForm || userReview) && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 p-4 border border-primary/20 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Your Review</label>
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this store..."
                  className="min-h-[100px]"
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {reviewText.length}/1000
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
                </Button>
                {showForm && !userReview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="glass border-primary/20 p-8">
            <div className="text-center text-muted-foreground">Loading reviews...</div>
          </Card>
        ) : reviews.length === 0 ? (
          <Card className="glass border-primary/20 p-8">
            <div className="text-center text-muted-foreground">No reviews yet</div>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="glass border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.profiles?.avatar_url || ''} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium">
                          {review.profiles?.full_name || 'Anonymous'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(review.created_at), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      {review.verified_purchase && (
                        <Badge variant="secondary" className="gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    {review.review_text && (
                      <p className="text-muted-foreground">{review.review_text}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StoreReviews;
