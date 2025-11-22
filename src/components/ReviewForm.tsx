import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StarRating from '@/components/StarRating';
import { Loader2 } from 'lucide-react';

interface ReviewFormProps {
  onSubmit: (rating: number, reviewText: string) => Promise<void>;
  isVerifiedPurchase?: boolean;
}

const ReviewForm = ({ onSubmit, isVerifiedPurchase = false }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(rating, reviewText);
      setRating(0);
      setReviewText('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Your Rating *</Label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onRatingChange={setRating}
        />
        {rating === 0 && (
          <p className="text-sm text-muted-foreground">Click to rate</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-text">Your Review (Optional)</Label>
        <Textarea
          id="review-text"
          placeholder="Share your experience with this product..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">
          {reviewText.length}/1000 characters
        </p>
      </div>

      {isVerifiedPurchase && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">
            ✓ Verified Purchase - Your review will be marked as verified
          </p>
        </div>
      )}

      <Button
        type="submit"
        variant="apple"
        disabled={rating === 0 || submitting}
        className="w-full"
      >
        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Submit Review
      </Button>
    </form>
  );
};

export default ReviewForm;
