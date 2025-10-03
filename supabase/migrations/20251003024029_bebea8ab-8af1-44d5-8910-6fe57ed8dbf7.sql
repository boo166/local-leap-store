-- Create site_content table for managing all static content
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can view site content
CREATE POLICY "Site content is viewable by everyone"
ON public.site_content
FOR SELECT
USING (true);

-- Only admins can manage site content
CREATE POLICY "Admins can manage site content"
ON public.site_content
FOR ALL
USING (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content
INSERT INTO public.site_content (section, content) VALUES
('hero', '{
  "title": "Build Your",
  "titleHighlight": "Digital Store",
  "description": "Experience the future of commerce with our glass-inspired platform. Create stunning online stores with Apple-quality design and seamless user experience.",
  "stats": {
    "stores": { "value": "50+", "label": "Local Stores" },
    "customers": { "value": "1000+", "label": "Happy Customers" },
    "growth": { "value": "85%", "label": "Growth Rate" }
  }
}'::jsonb),
('features', '{
  "title": "Everything You Need to Succeed",
  "subtitle": "Powerful features designed specifically for local businesses in emerging markets. Start selling online and reach customers beyond your village.",
  "items": [
    {
      "title": "Easy Store Setup",
      "description": "Create your online store in minutes with our intuitive setup process. No technical skills required.",
      "icon": "Store"
    },
    {
      "title": "Product Management",
      "description": "Upload products, manage inventory, and organize your catalog with our powerful tools.",
      "icon": "ShoppingCart"
    },
    {
      "title": "Local Payments",
      "description": "Accept M-Pesa, mobile money, and bank transfers. Get paid instantly and securely.",
      "icon": "CreditCard"
    },
    {
      "title": "Sales Analytics",
      "description": "Track your performance with detailed analytics and insights to grow your business.",
      "icon": "BarChart3"
    },
    {
      "title": "Customer Management",
      "description": "Build relationships with your customers through reviews, orders, and communication tools.",
      "icon": "Users"
    },
    {
      "title": "Secure & Reliable",
      "description": "Your data is protected with enterprise-grade security. Focus on selling, we handle the rest.",
      "icon": "Shield"
    }
  ]
}'::jsonb),
('showcase', '{
  "title": "Featured Design Stores",
  "subtitle": "Discover premium products from talented creators who share Apple''s passion for beautiful design. Support innovative businesses and find unique items crafted with precision and care."
}'::jsonb),
('cta', '{
  "title": "Ready to Transform Your Business?",
  "subtitle": "Join hundreds of local entrepreneurs who have already expanded their reach and increased their sales with VillageMarket. Your digital transformation starts today.",
  "benefits": [
    "Create your store in under 10 minutes",
    "No setup fees or hidden costs",
    "Accept local payment methods",
    "Mobile-optimized for your customers",
    "24/7 customer support in local languages"
  ],
  "disclaimer": "Free 30-day trial • No credit card required • Cancel anytime"
}'::jsonb);