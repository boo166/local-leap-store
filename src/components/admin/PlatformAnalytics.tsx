import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';

const COLORS = ['hsl(212, 100%, 50%)', 'hsl(265, 100%, 60%)', 'hsl(140, 80%, 50%)', 'hsl(40, 100%, 50%)', 'hsl(340, 80%, 60%)'];

interface PlatformAnalyticsProps {
  stores: any[];
  products: any[];
  orders: any[];
  users: any[];
  payments: any[];
}

const PlatformAnalytics: React.FC<PlatformAnalyticsProps> = ({
  stores,
  products,
  orders,
  users,
  payments,
}) => {
  const [dailyData, setDailyData] = useState<any[]>([]);

  useEffect(() => {
    generateDailyData();
  }, [orders, users]);

  const generateDailyData = () => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    const data = last30Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOrders = orders.filter(o => 
        format(new Date(o.created_at), 'yyyy-MM-dd') === dateStr
      );
      const dayUsers = users.filter(u => 
        format(new Date(u.created_at), 'yyyy-MM-dd') === dateStr
      );
      const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      return {
        date: format(date, 'MMM dd'),
        orders: dayOrders.length,
        users: dayUsers.length,
        revenue: dayRevenue,
      };
    });

    setDailyData(data);
  };

  // Category distribution
  const categoryData = products.reduce((acc: any[], product) => {
    const existing = acc.find(c => c.name === (product.category || 'Uncategorized'));
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: product.category || 'Uncategorized', value: 1 });
    }
    return acc;
  }, []);

  // Order status distribution
  const orderStatusData = orders.reduce((acc: any[], order) => {
    const existing = acc.find(s => s.name === order.status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: order.status, value: 1 });
    }
    return acc;
  }, []);

  // User role distribution
  const roleData = users.reduce((acc: any[], user) => {
    const roles = user.user_roles?.map((r: any) => r.role) || ['buyer'];
    roles.forEach((role: string) => {
      const existing = acc.find(r => r.name === role);
      if (existing) {
        existing.value += 1;
      } else {
        acc.push({ name: role, value: 1 });
      }
    });
    return acc;
  }, []);

  // Top performing stores
  const storePerformance = stores.map(store => {
    const storeProducts = products.filter(p => p.store_id === store.id);
    const productIds = storeProducts.map(p => p.id);
    const storeOrders = orders.filter(o => 
      o.order_items?.some((item: any) => productIds.includes(item.product_id))
    );
    const revenue = storeOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    
    return {
      name: store.name.length > 15 ? store.name.substring(0, 15) + '...' : store.name,
      products: storeProducts.length,
      orders: storeOrders.length,
      revenue,
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue & Orders Chart */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Daily orders and revenue over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="currentColor" opacity={0.5} fontSize={12} />
                  <YAxis yAxisId="left" stroke="currentColor" opacity={0.5} fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="currentColor" opacity={0.5} fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke="hsl(212, 100%, 50%)" strokeWidth={2} name="Orders" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(140, 80%, 50%)" strokeWidth={2} name="Revenue ($)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Order Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>User Roles Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roleData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Daily revenue over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="currentColor" opacity={0.5} fontSize={12} />
                  <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(140, 80%, 50%)" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Distribution of products by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="currentColor" opacity={0.5} fontSize={12} />
                  <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="users" fill="hsl(265, 100%, 60%)" name="New Users" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Top Performing Stores</CardTitle>
              <CardDescription>Stores ranked by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={storePerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis type="number" stroke="currentColor" opacity={0.5} fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="currentColor" opacity={0.5} fontSize={12} width={120} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(212, 100%, 50%)" name="Revenue ($)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformAnalytics;
