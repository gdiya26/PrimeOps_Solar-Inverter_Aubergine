const cron = require('node-cron');
const supabase = require('../config/supabaseClient');
const { sendAlertEmail } = require('../services/emailService');

// Schedule job to run every day at 8 AM
cron.schedule('0 8 * * *', async () => {
    console.log('Running daily alert job...');
    try {
        // Query Supabase alerts table where email_sent = false
        const { data: alerts, error: fetchError } = await supabase
            .from('alerts')
            .select('*')
            .eq('email_sent', false);

        if (fetchError) {
            console.error('Error fetching alerts:', fetchError);
            return;
        }

        if (!alerts || alerts.length === 0) {
            console.log('No unsent alerts found for today.');
            return;
        }

        // Send alerts using emailService
        await sendAlertEmail(alerts);

        // Extract IDs of sent alerts to update them
        const alertIds = alerts.map((alert) => alert.id);

        // Update alerts email_sent = true
        const { error: updateError } = await supabase
            .from('alerts')
            .update({ email_sent: true })
            .in('id', alertIds);

        if (updateError) {
            console.error('Error updating alerts as sent:', updateError);
        } else {
            console.log(`Successfully processed and sent ${alerts.length} alerts.`);
        }
    } catch (err) {
        console.error('Unexpected error in daily alert job:', err);
    }
});

console.log('Daily alert cron job registered (Runs at 8 AM daily).');
