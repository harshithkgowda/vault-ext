# Vault Extension - Secure Marketplace

A production-ready marketplace platform with secure escrow payments, built with Next.js, Supabase, and Razorpay.

## Features

- **Secure Escrow Payments**: Payments are held until buyer confirms delivery
- **Real-time Listings**: Browse and search thousands of active listings
- **User Authentication**: Email/password authentication with Supabase
- **Seller Dashboard**: Manage listings and track earnings
- **Buyer Dashboard**: Track purchases and confirm deliveries
- **Razorpay Integration**: Secure payment processing in Indian Rupees
- **Row-Level Security**: Database-level security with RLS policies

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Razorpay
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Razorpay account

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables in `.env.local`:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RAZORPAYX_KEY_ID=your_razorpayx_key_id
   RAZORPAYX_KEY_SECRET=your_razorpayx_key_secret
   \`\`\`

4. Run database migrations:
   \`\`\`bash
   npm run db:migrate
   \`\`\`

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Tables

- **profiles**: User profiles with authentication
- **listings**: Product listings with seller information
- **purchases**: Purchase records with payment status
- **payments**: Payment tracking with hold/release status

All tables have Row-Level Security (RLS) enabled for data protection.

## Payment Flow

1. Buyer purchases a listing
2. Razorpay payment is processed
3. Payment is held in escrow
4. Buyer receives item and confirms delivery
5. Payment is released to seller

## Security

- All data is protected with Row-Level Security (RLS)
- Passwords are hashed and never stored in plain text
- Payment signatures are verified server-side
- CORS and security headers are configured
- Environment variables are never exposed to the client

## Deployment

Deploy to Vercel:

\`\`\`bash
npm run build
vercel deploy
\`\`\`

## Support

For issues or questions, please open an issue on GitHub.

## License

MIT
