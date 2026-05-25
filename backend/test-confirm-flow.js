const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function generateValidDNI() {
  const province = String(Math.floor(Math.random() * 24) + 1).padStart(2, '0');
  const thirdDigit = String(Math.floor(Math.random() * 6));
  const rest = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
  const dni9 = province + thirdDigit + rest;
  
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let totalSum = 0;
  for (let i = 0; i < 9; i++) {
    let product = parseInt(dni9.charAt(i), 10) * coefficients[i];
    if (product >= 10) {
      product -= 9;
    }
    totalSum += product;
  }
  const nextTen = Math.ceil(totalSum / 10) * 10;
  let expectedCheckDigit = nextTen - totalSum;
  if (expectedCheckDigit === 10) {
    expectedCheckDigit = 0;
  }
  return dni9 + expectedCheckDigit;
}

async function run() {
  const testEmail = `paciente.test.${Date.now()}@ejemplo.com`;
  const password = 'password123';
  const dni = generateValidDNI();

  try {
    // 1. Register a new patient through NestJS Auth API to get a real token
    console.log(`[1] Registering new patient: ${testEmail} with DNI ${dni}...`);
    const regRes = await axios.post('http://localhost:3000/api/v1/auth/register', {
      email: testEmail,
      password: password,
      first_name: 'Test',
      last_name: 'Patient',
      dni: dni,
      phone: '0999999999',
      date_of_birth: '1995-01-01'
    });

    const token = regRes.data.session.access_token;
    console.log("Registered successfully! Token prefix:", token.substring(0, 10));

    // 2. Query valid specialty, doctor, and office to book an appointment
    console.log("[2] Querying specialty and doctor from DB...");
    const { data: specialties } = await supabase.from('specialties').select('id, name').eq('is_deleted', false).limit(1);
    const { data: doctors } = await supabase.from('doctors').select('id').eq('is_deleted', false).limit(1);
    
    if (!specialties.length || !doctors.length) {
      throw new Error("No active specialties or doctors found in database.");
    }
    
    const specialtyId = specialties[0].id;
    const doctorId = doctors[0].id;
    console.log(`Using Specialty: ${specialties[0].name} (${specialtyId}), Doctor ID: ${doctorId}`);

    // 3. Book an appointment through NestJS Appointments API
    console.log("[3] Booking an appointment...");
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 5); // 5 days from now
    startTime.setHours(9, 0, 0, 0);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 mins later

    // Create availability slot first to pass any validation
    await supabase.from('available_slots').insert([
      {
        doctor_id: doctorId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      }
    ]);

    const bookRes = await axios.post('http://localhost:3000/api/v1/appointments', {
      doctorId,
      appointmentTime: startTime.toISOString(),
      appointmentEndTime: endTime.toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const appointmentId = bookRes.data.id;
    console.log(`Appointment booked successfully! ID: ${appointmentId}`);

    // 4. Test confirming Stripe payment
    console.log(`[4] Sending POST /api/v1/payments/card/confirm for appointment ${appointmentId}...`);
    const confirmStart = Date.now();
    const confirmRes = await axios.post('http://localhost:3000/api/v1/payments/card/confirm', {
      appointmentId,
      amount: 50
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`[SUCCESS] Response received in ${Date.now() - confirmStart}ms!`);
    console.log("Status:", confirmRes.status);
    console.log("Data:", confirmRes.data);

  } catch (error) {
    if (error.response) {
      console.error(`[ERROR] HTTP ${error.response.status}:`, error.response.data);
    } else {
      console.error("[ERROR] Request failed:", error.message);
    }
  }
}

run();
