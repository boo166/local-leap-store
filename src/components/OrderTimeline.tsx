import React from 'react';
import { CheckCircle, Package, Truck, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  status: string;
  date: string;
  active: boolean;
  completed: boolean;
}

interface OrderTimelineProps {
  currentStatus: string;
  createdAt: string;
  cancelledAt?: string | null;
}

const OrderTimeline = ({ currentStatus, createdAt, cancelledAt }: OrderTimelineProps) => {
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = statuses.indexOf(currentStatus);
  
  const getIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'processing':
        return Package;
      case 'shipped':
        return Truck;
      case 'delivered':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      default:
        return Package;
    }
  };

  const getLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (currentStatus === 'cancelled') {
    const Icon = XCircle;
    return (
      <div className="py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <Icon className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="font-medium text-red-500">Order Cancelled</p>
            {cancelledAt && (
              <p className="text-xs text-muted-foreground">
                {new Date(cancelledAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {statuses.map((status, index) => {
          const Icon = getIcon(status);
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <React.Fragment key={status}>
              <div className="flex flex-col items-center gap-2 relative">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isActive && "bg-primary/20 ring-2 ring-primary",
                    isCompleted && "bg-green-500/20",
                    isUpcoming && "bg-muted"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive && "text-primary",
                      isCompleted && "text-green-500",
                      isUpcoming && "text-muted-foreground"
                    )}
                  />
                </div>
                <p
                  className={cn(
                    "text-xs font-medium text-center",
                    isActive && "text-primary",
                    isCompleted && "text-green-500",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {getLabel(status)}
                </p>
              </div>

              {index < statuses.length - 1 && (
                <div className="flex-1 h-0.5 bg-border mx-2 relative top-[-16px]">
                  <div
                    className={cn(
                      "h-full transition-all",
                      isCompleted && "bg-green-500"
                    )}
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
