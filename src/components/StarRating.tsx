import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

const StarRating = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  interactive = false,
  onRatingChange,
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const handleClick = (selectedRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(selectedRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(rating);
        const isPartial = starValue > rating && starValue - 1 < rating;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={cn(
              "relative",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled && "fill-yellow-400 text-yellow-400",
                !isFilled && "fill-transparent text-muted-foreground"
              )}
            />
          </button>
        );
      })}
      {showNumber && (
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
