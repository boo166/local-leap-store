import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  TrendingUp,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

interface PlatformOverviewProps {
  stores: any[];
  products: any[];
  orders: any[];
  users: any[];
  payments: any[];
}

const PlatformOverview: React.FC<PlatformOverviewProps> = ({
  stores,
  products,
  orders,
  users,
  payments,
}) => {
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const activeStores = stores.filter(s => s.is_active).length;
  const activeProducts = products.filter(p => p.is_active).length;
  
  // Calculate growth metrics (mock - would typically compare with previous period)
  const newUsersThisWeek = users.filter(u => {
    const createdAt = new Date(u.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdAt >= weekAgo;
  }).length;

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      subtitle: 'All time earnings',
    },
    {
      title: 'Active Stores',
      value: activeStores,
      icon: Store,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      subtitle: `${stores.length} total stores`,
    },
    {
      title: 'Active Products',
      value: activeProducts,
      icon: Package,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      subtitle: `${products.length} total products`,
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: ShoppingCart,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      subtitle: pendingOrders > 0 ? `${pendingOrders} pending` : 'All processed',
      alert: pendingOrders > 5,
    },
    {
      title: 'Registered Users',
      value: users.length,
      icon: Users,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      subtitle: `+${newUsersThisWeek} this week`,
    },
    {
      title: 'Pending Payments',
      value: pendingPayments,
      icon: CreditCard,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      subtitle: 'Awaiting review',
      alert: pendingPayments > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="glass-card relative overflow-hidden">
            {stat.alert && (
              <div className="absolute top-2 right-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />
              </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PlatformOverview;
