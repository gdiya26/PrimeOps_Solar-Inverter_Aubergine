require('dotenv').config();
const supabase = require('./backend/config/supabaseClient');

async function testQuery() {
    console.log('Testing Supabase query...');
    const tableName = 'Table 1';
    
    let { data, error } = await supabase
        .from('inverters')
        .select('id, status, mac_address, solar_tables!inner(name)')
        .eq('solar_tables.name', tableName);
        
    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Found ${data.length} inverters for ${tableName}`);
        console.log(data[0]);
    }
}

testQuery();
