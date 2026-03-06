require('dotenv').config({ path: './.env' });
const supabase = require('./config/supabaseClient');

async function testQuery() {
    let { data, error } = await supabase.from('solar_tables').select('name');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Tables found:', data);
    }
}

testQuery();
