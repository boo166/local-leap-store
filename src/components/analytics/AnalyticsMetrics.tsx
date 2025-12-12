import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, CheckCircle, Clock } from 'lucide-react';

interface AnalyticsMetricsProps {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
}

const AnalyticsMetrics: React.FC<AnalyticsMetricsProps> = ({
  totalRevenue,
  totalOrders,
  completedOrders,
  pendingOrders,
  averageOrderValue,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
    }).format(price);
  };

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      description: 'From completed orders',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      description: `${completedOrders} completed`,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Avg Order Value',
      value: formatPrice(averageOrderValue),
      icon: CheckCircle,
      description: 'Per order average',
      color: 'text-green-600',
      bgColor: 'bg-green-600/10',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      description: 'Awaiting processing',
      color: 'text-orange-600',
      bgColor: 'bg-orange-600/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {metric.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AnalyticsMetrics;
