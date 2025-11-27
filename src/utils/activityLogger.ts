import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to log user activities across the application
 */
export const logActivity = async (
  userId: string,
  activityType: string,
  activityCategory: 'auth' | 'profile' | 'order' | 'payment' | 'store' | 'product' | 'security',
  description: string,
  metadata: Record<string, any> = {}
): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('log_user_activity', {
      p_user_id: userId,
      p_activity_type: activityType,
      p_activity_category: activityCategory,
      p_description: description,
      p_metadata: metadata,
      p_ip_address: null,
      p_user_agent: navigator.userAgent
    });

    if (error) {
      console.error('Error logging activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error logging activity:', error);
    return false;
  }
};

/**
 * Activity type constants for consistency
 */
export const ActivityTypes = {
  // Auth
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  SIGNUP: 'Account Created',
  PASSWORD_CHANGE: 'Password Changed',
  PASSWORD_RESET: 'Password Reset',
  EMAIL_VERIFIED: 'Email Verified',
  
  // Profile
  PROFILE_UPDATE: 'Profile Updated',
  AVATAR_UPLOAD: 'Avatar Uploaded',
  AVATAR_DELETE: 'Avatar Deleted',
  
  // Orders
  ORDER_CREATED: 'Order Created',
  ORDER_CANCELLED: 'Order Cancelled',
  ORDER_COMPLETED: 'Order Completed',
  ORDER_SHIPPED: 'Order Shipped',
  
  // Payments
  PAYMENT_SUBMITTED: 'Payment Submitted',
  PAYMENT_APPROVED: 'Payment Approved',
  PAYMENT_REJECTED: 'Payment Rejected',
  
  // Store
  STORE_CREATED: 'Store Created',
  STORE_UPDATED: 'Store Updated',
  STORE_DELETED: 'Store Deleted',
  
  // Product
  PRODUCT_CREATED: 'Product Created',
  PRODUCT_UPDATED: 'Product Updated',
  PRODUCT_DELETED: 'Product Deleted',
  
  // Security
  SESSION_REVOKED: 'Session Revoked',
  MFA_ENABLED: '2FA Enabled',
  MFA_DISABLED: '2FA Disabled',
} as const;
