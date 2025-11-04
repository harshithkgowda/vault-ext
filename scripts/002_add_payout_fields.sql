-- Add payout-related fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_ifsc_code VARCHAR(11);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpayx_fund_account_id VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS razorpayx_contact_id VARCHAR(255);

-- Add payout tracking to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpayx_payout_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payout_status VARCHAR(50) DEFAULT 'pending';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_payout_status ON payments(payout_status);
CREATE INDEX IF NOT EXISTS idx_payments_razorpayx_payout_id ON payments(razorpayx_payout_id);
