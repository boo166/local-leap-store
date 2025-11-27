import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStoreAnalytics } from '@/hooks/useStoreAnalytics';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Eye, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface StoreAnalyticsDashboardProps {
  storeId: string;
}

const StoreAnalyticsDashboard: React.FC<StoreAnalyticsDashboardProps> = ({ storeId }) => {
  const { analytics, loading } = useStoreAnalytics(storeId, 30);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass border-primary/20 animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-8 bg-muted rounded w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="glass border-primary/20">
        <CardContent className="p-8 text-center text-muted-foreground">
          No analytics data available yet
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      title: 'Total Views',
      value: analytics.total_views?.toLocaleString() || '0',
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Unique Visitors',
      value: analytics.total_unique_visitors?.toLocaleString() || '0',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Orders',
      value: analytics.total_orders?.toLocaleString() || '0',
      icon: ShoppingCart,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Total Revenue',
      value: `$${Number(analytics.total_revenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
  ];

  const chartData = analytics.daily_data?.map(day => ({
    date: format(new Date(day.date), 'MMM dd'),
    views: day.views,
    visitors: day.unique_visitors,
    orders: day.orders,
    revenue: Number(day.revenue),
  })).reverse() || [];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="glass border-primary/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  {metric.title}
                </CardDescription>
                <CardTitle className="text-3xl">{metric.value}</CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Conversion Rate Card */}
      <Card className="glass border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conversion Rate</CardTitle>
              <CardDescription>Percentage of visitors who made a purchase</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <TrendingUp className="h-6 w-6 text-green-500" />
              {Number(analytics.avg_conversion_rate || 0).toFixed(2)}%
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="views" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="views">Views & Visitors</TabsTrigger>
          <TabsTrigger value="orders">Orders & Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="views">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle>Store Traffic</CardTitle>
              <CardDescription>Views and unique visitors over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <YAxis 
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Views"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Unique Visitors"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Orders and revenue over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="currentColor"
                    opacity={0.5}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="orders" 
                    fill="#a855f7" 
                    name="Orders"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="revenue" 
                    fill="#eab308" 
                    name="Revenue ($)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoreAnalyticsDashboard;
