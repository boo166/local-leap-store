import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StarRating from '@/components/StarRating';
import { Loader2, Upload, X } from 'lucide-react';
import { useReviewImageUpload } from '@/hooks/useReviewImageUpload';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewFormProps {
  onSubmit: (rating: number, reviewText: string, imageUrls: string[]) => Promise<void>;
  isVerifiedPurchase?: boolean;
}

const ReviewForm = ({ onSubmit, isVerifiedPurchase = false }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { uploadImages, uploading } = useReviewImageUpload();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 5) {
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0 || !user) {
      return;
    }

    setSubmitting(true);
    try {
      // Upload images first
      const imageUrls = await uploadImages(selectedFiles, user.id);
      
      await onSubmit(rating, reviewText, imageUrls);
      setRating(0);
      setReviewText('');
      setSelectedFiles([]);
      setPreviewUrls([]);
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

      <div className="space-y-2">
        <Label>Add Photos (Optional)</Label>
        <div className="flex flex-col gap-3">
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {selectedFiles.length < 5 && (
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Add up to {5 - selectedFiles.length} more image{5 - selectedFiles.length !== 1 ? 's' : ''} (max 5MB each)
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
          )}
        </div>
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
        disabled={rating === 0 || submitting || uploading}
        className="w-full"
      >
        {(submitting || uploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {uploading ? 'Uploading Images...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export default ReviewForm;
