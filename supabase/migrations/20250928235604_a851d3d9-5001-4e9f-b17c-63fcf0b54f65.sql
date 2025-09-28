-- Insert sample stores
INSERT INTO public.stores (user_id, name, description, category, location, image_url, is_active) VALUES
(
  '99c70e5b-e4b3-4116-89eb-02fb2b318413',
  'Tech Haven',
  'Premium electronics and gadgets for tech enthusiasts. We offer the latest smartphones, laptops, and accessories.',
  'Tech & Accessories',
  'San Francisco, CA',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
  true
),
(
  '99c70e5b-e4b3-4116-89eb-02fb2b318413',
  'Artisan Crafts',
  'Handmade jewelry, pottery, and unique gifts created by local artisans.',
  'Design & Lifestyle',
  'Austin, TX',
  'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop',
  true
);

-- Insert sample products for Tech Haven
WITH tech_store AS (
  SELECT id FROM public.stores WHERE name = 'Tech Haven' LIMIT 1
)
INSERT INTO public.products (store_id, name, description, price, category, image_url, inventory_count, is_active) VALUES
(
  (SELECT id FROM tech_store),
  'iPhone 15 Pro',
  'Latest Apple iPhone with advanced camera system and titanium design.',
  999.00,
  'Smartphones',
  'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
  25,
  true
),
(
  (SELECT id FROM tech_store),
  'MacBook Air M2',
  'Powerful and portable laptop perfect for work and creativity.',
  1199.00,
  'Laptops',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
  15,
  true
),
(
  (SELECT id FROM tech_store),
  'AirPods Pro',
  'Wireless earbuds with active noise cancellation.',
  249.00,
  'Audio',
  'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
  50,
  true
);

-- Insert sample products for Artisan Crafts
WITH craft_store AS (
  SELECT id FROM public.stores WHERE name = 'Artisan Crafts' LIMIT 1
)
INSERT INTO public.products (store_id, name, description, price, category, image_url, inventory_count, is_active) VALUES
(
  (SELECT id FROM craft_store),
  'Handwoven Ceramic Vase',
  'Beautiful ceramic vase handcrafted by local artisans, perfect for home decor.',
  89.00,
  'Home Decor',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
  12,
  true
),
(
  (SELECT id FROM craft_store),
  'Silver Statement Necklace',
  'Unique handmade silver necklace with intricate design patterns.',
  145.00,
  'Jewelry',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
  8,
  true
),
(
  (SELECT id FROM craft_store),
  'Organic Cotton Tote Bag',
  'Eco-friendly tote bag with hand-printed designs, perfect for daily use.',
  35.00,
  'Accessories',
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
  30,
  true
);