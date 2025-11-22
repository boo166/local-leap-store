import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  name: string;
  description: string;
}

interface Plan {
  name: string;
  features: {
    maxProducts: number | null;
    hasAnalytics: boolean;
    hasSupport: boolean;
    customFeatures?: string[];
  };
}

const PlanComparison = () => {
  const features: Feature[] = [
    {
      name: 'Products',
      description: 'Number of products you can list'
    },
    {
      name: 'Advanced Analytics',
      description: 'Detailed sales and performance insights'
    },
    {
      name: 'Priority Support',
      description: '24/7 customer support'
    },
    {
      name: 'Inventory Management',
      description: 'Track and manage your stock levels'
    },
    {
      name: 'Order Management',
      description: 'Process and fulfill customer orders'
    },
    {
      name: 'Payment Processing',
      description: 'Accept customer payments'
    }
  ];

  const plans: Plan[] = [
    {
      name: 'Free Trial',
      features: {
        maxProducts: 5,
        hasAnalytics: false,
        hasSupport: false,
        customFeatures: ['7 days trial', 'Basic features']
      }
    },
    {
      name: 'Basic',
      features: {
        maxProducts: 50,
        hasAnalytics: false,
        hasSupport: false,
        customFeatures: ['Perfect for small businesses']
      }
    },
    {
      name: 'Professional',
      features: {
        maxProducts: 200,
        hasAnalytics: true,
        hasSupport: true,
        customFeatures: ['For growing businesses']
      }
    },
    {
      name: 'Enterprise',
      features: {
        maxProducts: null,
        hasAnalytics: true,
        hasSupport: true,
        customFeatures: ['Unlimited everything', 'Custom integration']
      }
    }
  ];

  const getFeatureValue = (plan: Plan, featureName: string) => {
    switch (featureName) {
      case 'Products':
        return plan.features.maxProducts ? `${plan.features.maxProducts} products` : 'Unlimited';
      case 'Advanced Analytics':
        return plan.features.hasAnalytics;
      case 'Priority Support':
        return plan.features.hasSupport;
      default:
        return true; // All plans have basic features
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Plan Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-semibold">Features</th>
                {plans.map((plan) => (
                  <th key={plan.name} className="text-center p-4 font-semibold">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.name} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{feature.name}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </td>
                  {plans.map((plan) => {
                    const value = getFeatureValue(plan, feature.name);
                    return (
                      <td key={`${plan.name}-${feature.name}`} className="text-center p-4">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-medium">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanComparison;
