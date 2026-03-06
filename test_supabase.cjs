require('dotenv').config({ path: './backend/.env' });
const supabase = require('./backend/config/supabaseClient');
const { getTableFromBlock } = require('./backend/utils/blockMapper');

async function run() {
  const table = getTableFromBlock('A');
  console.log(`Testing query for Block A -> Table: ${table}`);
  
  const { data, error } = await supabase
    .from('inverters')
    .select('id, status, mac_address, solar_tables!inner(name)')
    .eq('solar_tables.name', table);
    
  if (error) {
     console.error('Error:', error);
  } else {
     console.log(`Success! Found ${data.length} inverters in Block A`);
     if (data.length > 0) {
         console.log('Sample Inverter:', data[0]);
     }
  }
}

run();
