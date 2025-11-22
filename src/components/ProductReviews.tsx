import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import StarRating from '@/components/StarRating';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import { useProductReviews } from '@/hooks/useProductReviews';
import { MessageSquare, TrendingUp } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const ProductReviews = ({ productId, productName }: ProductReviewsProps) => {
  const {
    reviews,
    stats,
    loading,
    userHasReviewed,
    canReview,
    submitReview,
    markHelpful,
  } = useProductReviews(productId);

  const [showReviewForm, setShowReviewForm] = useState(false);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">
          <div className="animate-pulse text-muted-foreground">
            Loading reviews...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Customer Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center space-y-2">
            <div className="text-5xl font-bold text-primary">
              {stats.averageRating.toFixed(1)}
            </div>
            <StarRating rating={stats.averageRating} size="lg" />
            <p className="text-sm text-muted-foreground">
              Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution];
              const percentage = stats.totalReviews > 0 
                ? (count / stats.totalReviews) * 100 
                : 0;

              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-8">{star}★</span>
                  <Progress value={percentage} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review Actions */}
        {!userHasReviewed && canReview && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              You've purchased this product. Share your experience!
            </p>
            <Button
              variant="apple"
              size="sm"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Write a Review
            </Button>
          </div>
        )}

        {userHasReviewed && (
          <Badge variant="secondary" className="w-full justify-center py-2">
            You've already reviewed this product
          </Badge>
        )}

        {/* Review Form */}
        {showReviewForm && canReview && !userHasReviewed && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Write Your Review</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewForm
                onSubmit={async (rating, reviewText) => {
                  await submitReview(rating, reviewText);
                  setShowReviewForm(false);
                }}
                isVerifiedPurchase={canReview}
              />
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Most Recent</TabsTrigger>
            <TabsTrigger value="helpful">Most Helpful</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-6">
            <ReviewList reviews={reviews} onMarkHelpful={markHelpful} />
          </TabsContent>

          <TabsContent value="helpful" className="mt-6">
            <ReviewList
              reviews={[...reviews].sort((a, b) => b.helpful_count - a.helpful_count)}
              onMarkHelpful={markHelpful}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProductReviews;
