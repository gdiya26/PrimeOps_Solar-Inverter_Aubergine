const cron = require('node-cron');
const { analyzeReadings } = require('../services/alertDetectionService');

// Schedule job to run every 10 minutes
cron.schedule('*/10 * * * *', async () => {
    console.log('Running inverter monitoring job (10m interval)...');
    await analyzeReadings();
});

console.log('Inverter monitoring cron job registered (Runs every 10 minutes).');
