import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
  typescript: true,
});

export const PRICING = {
  starter: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!,
    amount: 29,
    name: 'Starter Plan',
  },
  pro: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    amount: 99,
    name: 'Pro Plan',
  },
  enterprise: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID!,
    amount: 299,
    name: 'Enterprise Plan',
  },
};