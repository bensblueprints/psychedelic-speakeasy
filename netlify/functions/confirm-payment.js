// Netlify Function to confirm payment and create membership
const https = require('https');

const AIRWALLEX_API_KEY = process.env.AIRWALLEX_API_KEY;
const AIRWALLEX_CLIENT_ID = process.env.AIRWALLEX_CLIENT_ID;
const AIRWALLEX_API_URL = 'api.airwallex.com';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Service role key for admin operations

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
          resolve(JSON.parse(data).token);
        } else {
          reject(new Error(`Auth failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function getPaymentIntent(token, paymentIntentId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: AIRWALLEX_API_URL,
      path: `/api/v1/pa/payment_intents/${paymentIntentId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': AIRWALLEX_API_KEY,
        'x-client-id': AIRWALLEX_CLIENT_ID,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Get payment intent failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function createSupabaseUser(email, name, paymentIntentId) {
  const supabaseUrl = SUPABASE_URL.replace('https://', '');

  return new Promise((resolve, reject) => {
    // First create auth user
    const authPayload = JSON.stringify({
      email: email,
      password: Math.random().toString(36).slice(-12) + 'A1!', // Temporary password
      email_confirm: true,
      user_metadata: { name: name || email.split('@')[0] },
    });

    const authOptions = {
      hostname: supabaseUrl,
      path: '/auth/v1/admin/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    };

    const req = https.request(authOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const user = JSON.parse(data);
          resolve(user);
        } else {
          // User might already exist, try to get by email
          reject(new Error(`Create user failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(authPayload);
    req.end();
  });
}

async function createMembership(supabaseUrl, userId, paymentIntentId, amount) {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year membership

    const payload = JSON.stringify({
      userId: userId,
      status: 'active',
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      amount: amount * 100, // Store in cents
      stripeCustomerId: paymentIntentId, // Using this field for Airwallex payment ID
    });

    const hostname = SUPABASE_URL.replace('https://', '').replace('/','');

    const options = {
      hostname: hostname,
      path: '/rest/v1/memberships',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Create membership failed: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

exports.handler = async (event) => {
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
    const { paymentIntentId, email, name } = JSON.parse(event.body);

    if (!paymentIntentId || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payment intent ID and email are required' }),
      };
    }

    // Verify payment was successful
    const token = await getAccessToken();
    const paymentIntent = await getPaymentIntent(token, paymentIntentId);

    if (paymentIntent.status !== 'SUCCEEDED') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Payment not completed', status: paymentIntent.status }),
      };
    }

    // Create user in Supabase (they'll set their own password via magic link)
    let authUser;
    try {
      authUser = await createSupabaseUser(email, name, paymentIntentId);
    } catch (e) {
      console.log('User creation error (might already exist):', e.message);
      // If user exists, we'll handle membership creation anyway
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Payment confirmed! Check your email to set your password and access your membership.',
        email: email,
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
