const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const s = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
s.from('profiles').select('email, role').limit(10).then(r => {
    console.log('--- PROFILES ---');
    console.log(JSON.stringify(r.data, null, 2));
    process.exit(0);
});
