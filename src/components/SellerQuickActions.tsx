import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, Package, ShoppingBag, Settings, 
  BarChart3, Tag, Truck, Users
} from 'lucide-react';

interface SellerQuickActionsProps {
  hasStores: boolean;
  canAddProduct: boolean;
  pendingOrdersCount?: number;
}

const SellerQuickActions: React.FC<SellerQuickActionsProps> = ({ 
  hasStores, 
  canAddProduct,
  pendingOrdersCount = 0
}) => {
  const actions = [
    {
      icon: Plus,
      label: 'Add Product',
      href: '/add-product',
      disabled: !hasStores || !canAddProduct,
      tooltip: !hasStores ? 'Create a store first' : !canAddProduct ? 'Product limit reached' : undefined,
      variant: 'apple' as const,
    },
    {
      icon: ShoppingBag,
      label: 'Manage Orders',
      href: '/seller/orders',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      variant: 'outline' as const,
    },
    {
      icon: Package,
      label: 'View Products',
      href: '/dashboard?tab=products',
      variant: 'outline' as const,
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      href: '/dashboard?tab=analytics',
      variant: 'outline' as const,
    },
  ];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Link 
              key={action.label} 
              to={action.disabled ? '#' : action.href}
              className={action.disabled ? 'cursor-not-allowed' : ''}
            >
              <Button
                variant={action.variant}
                className="w-full h-auto py-3 flex flex-col gap-1.5 relative"
                disabled={action.disabled}
                title={action.tooltip}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs">{action.label}</span>
                {action.badge && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {action.badge > 99 ? '99+' : action.badge}
                  </span>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerQuickActions;
