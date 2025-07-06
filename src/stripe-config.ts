export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    priceId: 'price_1Rhu4HGhCqcC4ABPTK34vI00',
    name: '2,00',
    description: 'Premium book generation with advanced features',
    mode: 'payment',
    price: 2.00,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu42GhCqcC4ABPtxzAMuPv',
    name: '1,90',
    description: 'High-quality book generation',
    mode: 'payment',
    price: 1.90,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu3mGhCqcC4ABPDVxenPG4',
    name: '1,80',
    description: 'Enhanced book generation',
    mode: 'payment',
    price: 1.80,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu3UGhCqcC4ABPpi4iWVyh',
    name: '1,70',
    description: 'Professional book generation',
    mode: 'payment',
    price: 1.70,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu3DGhCqcC4ABPKwa8Mrw4',
    name: '1,60',
    description: 'Advanced book generation',
    mode: 'payment',
    price: 1.60,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu30GhCqcC4ABPTOEseqXq',
    name: '1,50',
    description: 'Standard plus book generation',
    mode: 'payment',
    price: 1.50,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu2nGhCqcC4ABPSUJCZYjv',
    name: '1,40',
    description: 'Standard book generation',
    mode: 'payment',
    price: 1.40,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu2aGhCqcC4ABPcA1m3tQo',
    name: '1,30',
    description: 'Basic plus book generation',
    mode: 'payment',
    price: 1.30,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu2LGhCqcC4ABPbIbBX3vW',
    name: '1,20',
    description: 'Basic book generation',
    mode: 'payment',
    price: 1.20,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu28GhCqcC4ABPyvPVPSyv',
    name: '1,10',
    description: 'Entry level book generation',
    mode: 'payment',
    price: 1.10,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu1vGhCqcC4ABPkbjfCM9q',
    name: '1,00',
    description: 'Starter book generation',
    mode: 'payment',
    price: 1.00,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu1gGhCqcC4ABPRXgxXpf2',
    name: '0,90',
    description: 'Budget book generation',
    mode: 'payment',
    price: 0.90,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu1SGhCqcC4ABP5mCQKGLe',
    name: '0,80',
    description: 'Economy book generation',
    mode: 'payment',
    price: 0.80,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu0wGhCqcC4ABPyiKq8sV7',
    name: '0,70',
    description: 'Light book generation',
    mode: 'payment',
    price: 0.70,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu0TGhCqcC4ABPBfUo8Hju',
    name: '0,60',
    description: 'Mini book generation',
    mode: 'payment',
    price: 0.60,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu0FGhCqcC4ABPkDddbAmN',
    name: '0,50',
    description: 'Micro book generation',
    mode: 'payment',
    price: 0.50,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhu02GhCqcC4ABPDEU4Y76H',
    name: '0,40',
    description: 'Nano book generation',
    mode: 'payment',
    price: 0.40,
    currency: 'EUR'
  },
  {
    priceId: 'price_1RhtzmGhCqcC4ABPuLjalptt',
    name: '0,30',
    description: 'Tiny book generation',
    mode: 'payment',
    price: 0.30,
    currency: 'EUR'
  },
  {
    priceId: 'price_1RhtzSGhCqcC4ABPFbDai7W6',
    name: '0,20',
    description: 'Sample book generation',
    mode: 'payment',
    price: 0.20,
    currency: 'EUR'
  },
  {
    priceId: 'price_1Rhtz2GhCqcC4ABPve9cWkif',
    name: '0,10',
    description: 'Test book generation',
    mode: 'payment',
    price: 0.10,
    currency: 'EUR'
  }
];