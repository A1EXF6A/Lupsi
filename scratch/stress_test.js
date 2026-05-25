const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const API_URL = 'http://localhost:3000/api/v1';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const DOCTOR_ID = '6f7d5ba0-9336-4a62-95a9-2717b647c584';

function generateValidDni() {
  const province = Math.floor(Math.random() * 24) + 1;
  const d1 = Math.floor(province / 10);
  const d2 = province % 10;
  const d3 = Math.floor(Math.random() * 6);
  const digits = [d1, d2, d3, ...Array.from({length: 6}, () => Math.floor(Math.random() * 10))];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let val = digits[i] * (i % 2 === 0 ? 2 : 1);
    if (val > 9) val -= 9;
    sum += val;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return digits.join('') + checkDigit;
}

async function getAuthToken() {
  const email = `tester_${Date.now()}@example.com`;
  const dni = generateValidDni();
  const password = 'LupsiProject2026';
  try {
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      email, password, first_name: 'Stress', last_name: 'Tester', dni, phone: '0999999999'
    });
    return regRes.data.session.access_token;
  } catch (e) {
    console.error('❌ Error crítico obteniendo token:', e.response?.data || e.message);
    process.exit(1);
  }
}

async function runAllTests() {
  console.log('🧪 INICIANDO SUITE DE PRUEBAS DINÁMICA\n');
  const token = await getAuthToken();
  const headers = { Authorization: `Bearer ${token}` };

  // Usamos una base de tiempo que cambie en cada ejecución
  const baseTime = new Date();
  baseTime.setFullYear(2027); // Lejos de cualquier cita real
  baseTime.setMonth(Math.floor(Math.random() * 12));
  baseTime.setDate(Math.floor(Math.random() * 28) + 1);
  baseTime.setHours(8, 0, 0, 0);

  // ST-01
  console.log('--- ST-01: Concurrencia Exacta ---');
  const time01 = new Date(baseTime.getTime()).toISOString();
  const reqs01 = [];
  for (let i = 0; i < 20; i++) {
    reqs01.push(axios.post(`${API_URL}/appointments`, { doctor_id: DOCTOR_ID, appointment_time: time01 }, { headers }).catch(e => e.response));
  }
  const res01 = await Promise.all(reqs01);
  const success01 = res01.filter(r => r?.status === 201).length;
  const conflict01 = res01.filter(r => r?.status === 409).length;
  const others01 = res01.filter(r => r?.status !== 201 && r?.status !== 409);
  
  console.log(`Resultados: Éxitos=${success01}, Conflictos=${conflict01}, Otros=${others01.length}`);
  if (others01.length > 0) {
    console.log(`⚠️ Códigos inesperados: ${[...new Set(others01.map(r => r?.status))].join(', ')}`);
    if (others01[0]?.data) console.log('Ejemplo error:', others01[0].data);
  }
  console.log(success01 === 1 ? '✅ PASS' : '❌ FAIL');

  // ST-02
  console.log('\n--- ST-02: Traslape Parcial ---');
  const time02A = new Date(baseTime.getTime() + 3600000).toISOString();
  const time02B = new Date(baseTime.getTime() + 3600000 + 15 * 60000).toISOString();
  await axios.post(`${API_URL}/appointments`, { doctor_id: DOCTOR_ID, appointment_time: time02A }, { headers });
  try {
    await axios.post(`${API_URL}/appointments`, { doctor_id: DOCTOR_ID, appointment_time: time02B }, { headers });
    console.log('❌ FAIL: Se permitió traslape');
  } catch (e) {
    console.log(e.response?.status === 409 ? '✅ PASS' : `❌ FAIL: ${e.response?.status}`);
  }

  // ST-03
  console.log('\n--- ST-03: Adjacencia ---');
  const time03A = new Date(baseTime.getTime() + 2 * 3600000).toISOString();
  const time03B = new Date(baseTime.getTime() + 2 * 3600000 + 30 * 60000).toISOString();
  try {
    await axios.post(`${API_URL}/appointments`, { doctor_id: DOCTOR_ID, appointment_time: time03A }, { headers });
    await axios.post(`${API_URL}/appointments`, { doctor_id: DOCTOR_ID, appointment_time: time03B }, { headers });
    console.log('✅ PASS');
  } catch (e) {
    console.log('❌ FAIL', e.response?.data);
  }

  // ST-04
  console.log('\n--- ST-04: Reuso tras Borrado ---');
  const time04 = new Date(baseTime.getTime() + 3 * 3600000).toISOString();
  const res04 = await axios.post(`${API_URL}/appointments`, { doctor_id: DOCTOR_ID, appointment_time: time04 }, { headers });
  await axios.delete(`${API_URL}/appointments/${res04.data.id}`, { headers });
  try {
    await axios.post(`${API_URL}/appointments`, { doctor_id: DOCTOR_ID, appointment_time: time04 }, { headers });
    console.log('✅ PASS');
  } catch (e) {
    console.log('❌ FAIL', e.response?.data);
  }

  // ST-05
  console.log('\n--- ST-05: Multi-Doctor ---');
  const { data: docs } = await supabase.from('doctors').select('id').neq('id', DOCTOR_ID).limit(1);
  if (docs?.length) {
    const time05 = new Date(baseTime.getTime() + 4 * 3600000).toISOString();
    try {
      await axios.post(`${API_URL}/appointments`, { doctor_id: DOCTOR_ID, appointment_time: time05 }, { headers });
      await axios.post(`${API_URL}/appointments`, { doctor_id: docs[0].id, appointment_time: time05 }, { headers });
      console.log('✅ PASS');
    } catch (e) {
      console.log('❌ FAIL', e.response?.data);
    }
  }
  // ST-06
  console.log('\n--- ST-06: Variación de Duración ---');
  const time06Base = new Date(baseTime.getTime() + 5 * 3600000).toISOString();
  const time06Overlap = new Date(baseTime.getTime() + 5 * 3600000 + 45 * 60000).toISOString();
  
  try {
    // Agendamos una cita larga (60 min)
    await axios.post(`${API_URL}/appointments`, { 
      doctor_id: DOCTOR_ID, 
      appointment_time: time06Base,
      duration_minutes: 60 
    }, { headers });
    
    // Intentamos agendar una cita de 30 min que se traslapa al final de la de 60 min
    await axios.post(`${API_URL}/appointments`, { 
      doctor_id: DOCTOR_ID, 
      appointment_time: time06Overlap 
    }, { headers });
    
    console.log('❌ FAIL: Se permitió traslape con cita de 60 min');
  } catch (e) {
    console.log(e.response?.status === 409 ? '✅ PASS' : `❌ FAIL: ${e.response?.status}`);
  }

  console.log('\n🏁 PRUEBAS COMPLETADAS');
}
runAllTests().catch(console.error);
