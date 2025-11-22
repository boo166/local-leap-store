import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { useUsageStats } from '@/hooks/useUsageStats';

const UsageTracker = () => {
  const { stats, loading } = useUsageStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-orange-500';
    return 'text-green-500';
  };

  const getUsageBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge variant="destructive">Critical</Badge>;
    if (percentage >= 75) return <Badge className="bg-orange-500">Warning</Badge>;
    return <Badge variant="secondary" className="bg-green-500">Healthy</Badge>;
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usage Overview</CardTitle>
            {getUsageBadge(stats.usage_percentage)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Usage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="font-medium">Products</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${getUsageColor(stats.usage_percentage)}`}>
                  {stats.total_products}
                </span>
                <span className="text-muted-foreground">
                  / {stats.product_limit === 0 ? '∞' : stats.product_limit}
                </span>
              </div>
            </div>
            <Progress 
              value={stats.product_limit === 0 ? 0 : stats.usage_percentage} 
              className="h-2"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {stats.active_products} active
              </span>
              <span className={getUsageColor(stats.usage_percentage)}>
                {stats.usage_percentage}% used
              </span>
            </div>
            {stats.usage_percentage >= 75 && stats.product_limit > 0 && (
              <div className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                <p className="text-sm text-orange-500">
                  {stats.usage_percentage >= 90 
                    ? 'You\'re at your product limit! Consider upgrading your plan to add more products.'
                    : 'You\'re approaching your product limit. Consider upgrading soon.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total_orders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsageTracker;
