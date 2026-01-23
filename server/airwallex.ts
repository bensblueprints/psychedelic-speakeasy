import { Router } from "express";
import axios from "axios";

const router = Router();

// Airwallex API configuration
const AIRWALLEX_API_URL = process.env.AIRWALLEX_ENV === 'production' 
  ? 'https://api.airwallex.com' 
  : 'https://api-demo.airwallex.com';

// Get access token from Airwallex
async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.AIRWALLEX_CLIENT_ID;
  const apiKey = process.env.AIRWALLEX_API_KEY;

  if (!clientId || !apiKey) {
    console.warn('[Airwallex] Missing API credentials');
    return null;
  }

  try {
    const response = await axios.post(
      `${AIRWALLEX_API_URL}/api/v1/authentication/login`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId,
          'x-api-key': apiKey,
        },
      }
    );
    return response.data.token;
  } catch (error) {
    console.error('[Airwallex] Failed to get access token:', error);
    return null;
  }
}

// Create a PaymentIntent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'USD', userId, userEmail, userName } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return res.status(500).json({ error: 'Failed to authenticate with Airwallex' });
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const merchantOrderId = `order_${Date.now()}_${userId || 'guest'}`;

    // Get the origin for return URL
    const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'http://localhost:3000';

    const response = await axios.post(
      `${AIRWALLEX_API_URL}/api/v1/pa/payment_intents/create`,
      {
        request_id: requestId,
        amount: amount,
        currency: currency,
        merchant_order_id: merchantOrderId,
        return_url: `${origin}/payment/success`,
        metadata: {
          user_id: userId?.toString() || '',
          user_email: userEmail || '',
          user_name: userName || '',
          product: 'psychedelic_speakeasy_membership',
          plan: 'annual',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const { id, client_secret } = response.data;

    res.json({
      intentId: id,
      clientSecret: client_secret,
      currency: currency,
      amount: amount,
    });
  } catch (error: any) {
    console.error('[Airwallex] Failed to create payment intent:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error.response?.data?.message || error.message 
    });
  }
});

// Webhook handler for Airwallex events
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    console.log('[Airwallex Webhook] Received event:', event.name);

    // Handle different event types
    switch (event.name) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('[Airwallex] Payment succeeded:', paymentIntent.id);
        
        // Extract user info from metadata
        const metadata = paymentIntent.metadata || {};
        const userId = metadata.user_id;
        
        if (userId) {
          // TODO: Update user's membership status in database
          console.log(`[Airwallex] Granting membership to user: ${userId}`);
        }
        break;

      case 'payment_intent.payment_failed':
        console.log('[Airwallex] Payment failed:', event.data.object.id);
        break;

      case 'payment_intent.cancelled':
        console.log('[Airwallex] Payment cancelled:', event.data.object.id);
        break;

      default:
        console.log('[Airwallex] Unhandled event type:', event.name);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[Airwallex Webhook] Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Check Airwallex configuration status
router.get('/status', async (req, res) => {
  const clientId = process.env.AIRWALLEX_CLIENT_ID;
  const apiKey = process.env.AIRWALLEX_API_KEY;
  
  const isConfigured = !!(clientId && apiKey);
  
  res.json({
    configured: isConfigured,
    environment: process.env.AIRWALLEX_ENV || 'demo',
  });
});

export default router;
