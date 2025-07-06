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

  console.log('Creating checkout session with params:', params);

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
    const errorText = await response.text();
    console.error('Checkout session creation failed:', errorText);
    
    let errorMessage = 'Failed to create checkout session';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorMessage;
    } catch (e) {
      // If not JSON, use the text as error message
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('Checkout session created:', result);
  
  return result;
};

export const getSessionFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('session_id');
};

export const verifyPayment = async (sessionId: string): Promise<boolean> => {
  try {
    // In a real implementation, you might want to verify the session with Stripe
    // For now, we'll assume if we have a session_id, payment was successful
    console.log('Verifying payment for session:', sessionId);
    return !!sessionId && sessionId.startsWith('cs_');
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
};