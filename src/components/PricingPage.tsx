import React, { useState } from 'react';
import { STRIPE_PRODUCTS, StripeProduct } from '../stripe-config';
import { SpinnerIcon } from './icons';
import { createCheckoutSession } from '../services/stripeService';

interface PricingPageProps {
  onBack: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBack }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (product: StripeProduct) => {
    setLoading(product.priceId);
    
    try {
      const successUrl = `${window.location.origin}/success`;
      const cancelUrl = window.location.href;
      
      const { url } = await createCheckoutSession({
        priceId: product.priceId,
        mode: product.mode,
        successUrl,
        cancelUrl,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  // Sort products by price (highest to lowest)
  const sortedProducts = [...STRIPE_PRODUCTS].sort((a, b) => b.price - a.price);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <button
            onClick={onBack}
            className="mb-6 text-indigo-400 hover:text-indigo-300 transition duration-200"
          >
            ← Back to Book Generator
          </button>
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-slate-400 text-lg">
            Select the perfect option for your book generation needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <div
              key={product.priceId}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-indigo-500/50 transition duration-300"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <div className="text-3xl font-bold text-indigo-400 mb-2">
                  €{product.price.toFixed(2)}
                </div>
                <p className="text-slate-400 text-sm">{product.description}</p>
              </div>

              <button
                onClick={() => handlePurchase(product)}
                disabled={loading === product.priceId}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center"
              >
                {loading === product.priceId ? (
                  <SpinnerIcon className="w-5 h-5 animate-spin" />
                ) : (
                  'Purchase'
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">What's Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
              <div>
                <h3 className="font-semibold text-white mb-2">AI-Generated Content</h3>
                <p className="text-sm">Complete chapters with engaging storylines</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Custom Illustrations</h3>
                <p className="text-sm">Beautiful AI-generated images for each chapter</p>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">PDF Download</h3>
                <p className="text-sm">Professional PDF format ready for printing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;