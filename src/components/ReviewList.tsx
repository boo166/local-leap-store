import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StarRating from '@/components/StarRating';
import { ThumbsUp, ShieldCheck } from 'lucide-react';
import { Review } from '@/hooks/useProductReviews';

interface ReviewListProps {
  reviews: Review[];
  onMarkHelpful: (reviewId: string) => void;
}

const ReviewList = ({ reviews, onMarkHelpful }: ReviewListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="space-y-3">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={review.profiles?.avatar_url || undefined} />
              <AvatarFallback>
                {review.profiles?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {review.profiles?.full_name || 'Anonymous User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(review.created_at)}
                  </p>
                </div>
                {review.verified_purchase && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified Purchase
                  </Badge>
                )}
              </div>

              <StarRating rating={review.rating} size="sm" />

              {review.review_text && (
                <p className="text-sm text-foreground leading-relaxed">
                  {review.review_text}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkHelpful(review.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Helpful ({review.helpful_count})
                </Button>
              </div>
            </div>
          </div>

          <Separator />
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
