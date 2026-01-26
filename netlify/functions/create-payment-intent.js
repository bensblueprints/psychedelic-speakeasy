// Netlify Function to create Airwallex Payment Intent
const https = require('https');

const AIRWALLEX_API_KEY = process.env.AIRWALLEX_API_KEY;
const AIRWALLEX_CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID;
const AIRWALLEX_API_URL = 'api.airwallex.com'; // Use api-demo.airwallex.com for sandbox

async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: AIRWALLEX_API_URL,
      path: '/api/v1/authentication/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AIRWALLEX_API_KEY,
        'x-client-id': AIRWALLEX_CLIENT_ID,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          const response = JSON.parse(data);
          resolve(response.token);
        } else {
          reject(new Error(`Auth failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function createPaymentIntent(token, email) {
  return new Promise((resolve, reject) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payload = JSON.stringify({
      amount: 97.00,
      currency: 'USD',
      merchant_order_id: `membership_${Date.now()}`,
      request_id: requestId,
      metadata: {
        email: email,
        product: 'annual_membership',
        price: 97,
      },
      order: {
        products: [{
          name: 'Psychedelic Speakeasy Annual Membership',
          quantity: 1,
          unit_price: 97.00,
          desc: 'Full access to vetted vendors, community, and resources for one year',
        }],
      },
    });

    const options = {
      hostname: AIRWALLEX_API_URL,
      path: '/api/v1/pa/payment_intents/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': AIRWALLEX_API_KEY,
        'x-client-id': AIRWALLEX_CLIENT_ID,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Payment intent failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' }),
      };
    }

    // Get access token
    const token = await getAccessToken();

    // Create payment intent
    const paymentIntent = await createPaymentIntent(token, email);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
