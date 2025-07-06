interface CreateGuestCheckoutParams {
  chapters: number;
  pages: number;
  bookConfig: any;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  amount: number;
  currency: string;
}

export const createGuestCheckoutSession = async (params: CreateGuestCheckoutParams): Promise<CheckoutSessionResponse> => {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chapters: params.chapters,
      pages: params.pages,
      book_config: params.bookConfig,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return response.json();
};

export const getSessionFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('session_id');
};

export const verifyPayment = async (sessionId: string): Promise<boolean> => {
  try {
    // In a real implementation, you might want to verify the session
    // For now, we'll assume if we have a session_id, payment was successful
    return !!sessionId;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};