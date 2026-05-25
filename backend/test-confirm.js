const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    // 1. Log in to get a JWT token
    console.log("Logging in via Supabase...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'sebas@gmail.co',
      password: 'password123' // or whatever the password is, let's see
    });

    if (authError) {
      // If password123 is wrong, we'll try to find a valid user or just get the token another way
      throw new Error(`Auth failed: ${authError.message}`);
    }

    const token = authData.session.access_token;
    console.log("Successfully obtained JWT token!");

    // 2. We need an appointment ID that is not already paid or we can just use the one we queried
    const appointmentId = '3a913512-685a-4a55-a050-670431c90f92'; // The one that's already paid is fine for testing HTTP response behavior
    
    console.log(`Sending POST /api/v1/payments/card/confirm for appointment ${appointmentId}...`);
    const startTime = Date.now();
    const response = await axios.post('http://localhost:3000/api/v1/payments/card/confirm', {
      appointmentId,
      amount: 50
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log(`Received response in ${Date.now() - startTime}ms!`);
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);

  } catch (error) {
    if (error.response) {
      console.log(`Error Response received in ${error.response.headers['x-response-time'] || ''}ms:`, error.response.status, error.response.data);
    } else {
      console.error("Axios Error:", error.message);
    }
  }
}

run();
