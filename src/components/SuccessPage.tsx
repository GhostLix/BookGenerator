import React, { useEffect } from 'react';
import { BookOpenIcon } from './icons';

interface SuccessPageProps {
  onContinue: () => void;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ onContinue }) => {
  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-2xl bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-green-900/20 p-8 border border-slate-700 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            Payment Successful!
          </h1>
          <p className="text-slate-400 text-lg">
            Thank you for your purchase. You can now create amazing AI-generated books.
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-6 mb-8">
          <BookOpenIcon className="w-12 h-12 mx-auto text-indigo-400 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Ready to Create</h2>
          <p className="text-slate-300">
            Your payment has been processed successfully. Start generating your first book now!
          </p>
        </div>

        <button
          onClick={onContinue}
          className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-indigo-500 transition duration-300 text-lg"
        >
          Start Creating Books
        </button>

        <p className="text-slate-500 text-sm mt-4">
          Redirecting automatically in 5 seconds...
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;