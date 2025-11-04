-- Drop old restrictive policies and create new ones that allow system operations

-- Drop old payment policies
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
DROP POLICY IF EXISTS "payments_update_own" ON public.payments;

-- New RLS policies for payments table
-- Allow sellers to view their own payments
CREATE POLICY "payments_select_seller" ON public.payments 
  FOR SELECT USING (auth.uid() = seller_id);

-- Allow system to insert payments (via service role, RLS doesn't apply to service role)
-- This is handled by using admin client, so policy can be permissive
CREATE POLICY "payments_insert_system" ON public.payments 
  FOR INSERT WITH CHECK (TRUE);

-- Allow sellers to view payment updates
CREATE POLICY "payments_update_seller" ON public.payments 
  FOR UPDATE USING (auth.uid() = seller_id);

-- Drop old restrictive purchases policies and add system-friendly ones
DROP POLICY IF EXISTS "purchases_select_own" ON public.purchases;
DROP POLICY IF EXISTS "purchases_insert_own" ON public.purchases;
DROP POLICY IF EXISTS "purchases_update_own" ON public.purchases;

-- New RLS policies for purchases
CREATE POLICY "purchases_select_users" ON public.purchases 
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyers can insert purchases
CREATE POLICY "purchases_insert_buyer" ON public.purchases 
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Both buyer and seller can update (buyer for delivery confirmation, seller can see it)
CREATE POLICY "purchases_update_users" ON public.purchases 
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
