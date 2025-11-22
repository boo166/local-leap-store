import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Tag, CheckCircle2 } from 'lucide-react';

const shippingSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Phone number must be at least 10 characters').max(20),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500),
  city: z.string().min(2, 'City must be at least 2 characters').max(100),
  postalCode: z.string().min(3, 'Postal code must be at least 3 characters').max(20),
  notes: z.string().max(500).optional(),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  cartItems: any[];
  totalAmount: number;
  userId: string;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onClose,
  cartItems,
  totalAmount,
  userId,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      notes: '',
    },
  });

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('validate_promo_code', {
          code_param: promoCode.toUpperCase(),
          cart_total_param: totalAmount
        });

      if (error) throw error;

      const result = data[0];
      if (result.is_valid) {
        setDiscount(result.discount_amount);
        setPromoApplied(true);
        setPromoMessage(result.message);
        toast({
          title: "Promo code applied!",
          description: `You saved $${result.discount_amount.toFixed(2)}`,
        });
      } else {
        setPromoMessage(result.message);
        toast({
          title: "Invalid promo code",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error applying promo code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPromoLoading(false);
    }
  };

  const finalAmount = totalAmount - discount;

  const onSubmit = async (data: ShippingFormData) => {
    setSubmitting(true);
    try {
      const shippingAddress = `${data.fullName}\n${data.phone}\n${data.address}\n${data.city}, ${data.postalCode}${data.notes ? `\nNotes: ${data.notes}` : ''}`;

      // Create order with discounted amount
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: finalAmount,
          status: 'pending',
          shipping_address: shippingAddress,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.products.id,
        quantity: item.quantity,
        price_at_time: item.products.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (clearError) throw clearError;

      toast({
        title: 'Order placed successfully!',
        description: 'Thank you for your purchase. You can track your order in the Orders page.',
      });

      onClose();
      navigate('/orders');
    } catch (error: any) {
      toast({
        title: 'Checkout failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shipping Information</DialogTitle>
          <DialogDescription>
            Please provide your shipping details to complete your order.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Promo Code Section */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={promoApplied}
                />
                <Button
                  type="button"
                  variant={promoApplied ? "default" : "outline"}
                  onClick={applyPromoCode}
                  disabled={promoLoading || promoApplied || !promoCode.trim()}
                >
                  {promoLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {promoApplied ? <CheckCircle2 className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
                </Button>
              </div>
              {promoMessage && (
                <p className={`text-sm ${promoApplied ? 'text-green-600' : 'text-destructive'}`}>
                  {promoMessage}
                </p>
              )}
            </div>

            {/* Order Summary */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">${finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="123 Main Street, Apt 4B" 
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special instructions for delivery..."
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="apple" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place Order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
