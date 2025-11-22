import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import StarRating from '@/components/StarRating';
import { ThumbsUp, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { Review } from '@/hooks/useProductReviews';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

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
