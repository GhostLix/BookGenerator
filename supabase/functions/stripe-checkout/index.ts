import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'AI Story Weaver',
    version: '1.0.0',
  },
});

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { 
      chapters, 
      pages, 
      success_url, 
      cancel_url,
      book_config 
    } = await req.json();

    // Validate required parameters
    if (!chapters || !pages || !success_url || !cancel_url || !book_config) {
      return corsResponse({ 
        error: 'Missing required parameters: chapters, pages, success_url, cancel_url, book_config' 
      }, 400);
    }

    // Calculate price: 1 chapter = 10 cents, 100 pages = 10 cents
    const chapterPrice = chapters * 0.10; // 10 cents per chapter
    const pagePrice = (pages / 100) * 0.10; // 10 cents per 100 pages
    const totalPrice = chapterPrice + pagePrice;
    
    // Convert to cents for Stripe (minimum 50 cents)
    const amountInCents = Math.max(50, Math.round(totalPrice * 100));

    console.log(`Calculated price: ${chapters} chapters (€${chapterPrice.toFixed(2)}) + ${pages} pages (€${pagePrice.toFixed(2)}) = €${totalPrice.toFixed(2)} (${amountInCents} cents)`);

    // Create checkout session for guest payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `AI Generated Book: "${book_config.title}"`,
              description: `${chapters} chapters, ~${pages} pages - ${book_config.genre}`,
              metadata: {
                chapters: chapters.toString(),
                pages: pages.toString(),
                art_style: book_config.artStyle,
                language: book_config.language,
              },
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url,
      metadata: {
        book_config: JSON.stringify(book_config),
        chapters: chapters.toString(),
        pages: pages.toString(),
      },
    });

    console.log(`Created checkout session ${session.id} for €${(amountInCents / 100).toFixed(2)}`);

    return corsResponse({ 
      sessionId: session.id, 
      url: session.url,
      amount: amountInCents,
      currency: 'eur'
    });
  } catch (error: any) {
    console.error(`Checkout error: ${error.message}`);
    return corsResponse({ error: error.message }, 500);
  }
});