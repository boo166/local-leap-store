import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Store,
  Package,
  CreditCard,
  MessageSquare,
  Shield,
  FileText,
  Settings,
} from 'lucide-react';

interface AdminQuickActionsProps {
  onNavigate: (tab: string) => void;
  pendingPayments: number;
  pendingReviews: number;
  pendingVerifications: number;
}

const AdminQuickActions: React.FC<AdminQuickActionsProps> = ({
  onNavigate,
  pendingPayments,
  pendingReviews,
  pendingVerifications,
}) => {
  const actions = [
    {
      label: 'Review Payments',
      icon: CreditCard,
      tab: 'payments',
      badge: pendingPayments,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      urgent: pendingPayments > 0,
    },
    {
      label: 'Moderate Reviews',
      icon: MessageSquare,
      tab: 'reviews',
      badge: pendingReviews,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      urgent: pendingReviews > 0,
    },
    {
      label: 'Store Verifications',
      icon: Shield,
      tab: 'verifications',
      badge: pendingVerifications,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      urgent: pendingVerifications > 0,
    },
    {
      label: 'Manage Users',
      icon: Users,
      tab: 'users',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Manage Stores',
      icon: Store,
      tab: 'stores',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      label: 'Manage Products',
      icon: Package,
      tab: 'products',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      label: 'Site Content',
      icon: FileText,
      tab: 'content',
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
    },
    {
      label: 'Platform Analytics',
      icon: Settings,
      tab: 'analytics',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.tab}
                variant="outline"
                className={`h-auto py-4 px-3 flex flex-col items-center gap-2 relative ${
                  action.urgent ? 'border-amber-500/50 animate-pulse' : ''
                }`}
                onClick={() => onNavigate(action.tab)}
              >
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-xs text-center">{action.label}</span>
                {action.badge !== undefined && action.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {action.badge}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminQuickActions;
