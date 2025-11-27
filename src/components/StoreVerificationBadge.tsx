import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ShieldCheck, Award, Crown } from 'lucide-react';

interface StoreVerificationBadgeProps {
  isVerified: boolean;
  verificationType?: 'basic' | 'premium' | 'enterprise';
  className?: string;
}

const StoreVerificationBadge: React.FC<StoreVerificationBadgeProps> = ({
  isVerified,
  verificationType = 'basic',
  className = '',
}) => {
  if (!isVerified) return null;

  const badgeConfig = {
    basic: {
      icon: ShieldCheck,
      label: 'Verified Store',
      description: 'This store has been verified by our team',
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    premium: {
      icon: Award,
      label: 'Premium Verified',
      description: 'Premium verified store with enhanced trust indicators',
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
    enterprise: {
      icon: Crown,
      label: 'Enterprise Verified',
      description: 'Top-tier verified enterprise store',
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
  };

  const config = badgeConfig[verificationType];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`gap-1 ${config.color} ${className}`}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StoreVerificationBadge;
