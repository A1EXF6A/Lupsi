const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://qlhmezyxhptvpyiepluw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaG1lenl4aHB0dnB5aWVwbHV3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ3MDU2MywiZXhwIjoyMDkwMDQ2NTYzfQ.Zgr-LdEnJtqYRVq29Mwe9pEan7-2_0VFKgZaA1LV4Tg'
);

async function testInsert() {
  const { data, error } = await supabase
    .from('appointment_payments')
    .insert([
      {
        appointment_id: 'fb1b1e71-4171-4c60-845f-14ab7710c663', // from screenshot fb1b1e71, wait I need a valid one. I will select one first.
        amount: 50,
        method: 'CARD',
        status: 'COMPLETED',
        paid_at: new Date().toISOString(),
      },
    ]);
  console.log("Error:", error);
  console.log("Data:", data);
}

async function run() {
  // get a real appointment
  const { data: apts } = await supabase.from('appointments').select('id').limit(1);
  const aptId = apts[0].id;
  console.log("Using appointment:", aptId);
  
  const { data, error } = await supabase
    .from('appointment_payments')
    .insert([
      {
        appointment_id: aptId,
        amount: 50,
        method: 'CARD',
        status: 'COMPLETED',
        paid_at: new Date().toISOString(),
      },
    ]);
  console.log("Insert Error:", error);
  console.log("Insert Data:", data);
}

run();
