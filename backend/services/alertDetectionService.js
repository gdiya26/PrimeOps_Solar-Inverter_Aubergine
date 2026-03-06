const supabase = require('../config/supabaseClient');

const analyzeReadings = async () => {
    try {
        console.log('Starting anomaly detection for recent inverter readings...');
        
        // 1. Fetch latest readings for each inverter (to analyze) 
        // We'll get readings from the last hour or so, assuming the job runs every 10m
        // To simplify, we get the latest row for each inverter by querying all unique inverters first 
        // Or fetch all readings from the last 15 minutes
        
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60000).toISOString();

        const { data: recentReadings, error: readingsError } = await supabase
            .from('inverter_readings')
            .select('*, inverters!inner(name, id)')
            .gte('timestamp', fifteenMinutesAgo)
            .order('timestamp', { ascending: false });

        if (readingsError) {
            console.error('Error fetching recent readings:', readingsError);
            return;
        }

        if (!recentReadings || recentReadings.length === 0) {
            console.log('No recent readings found.');
            return;
        }

        // Processing latest reading per inverter
        const processedInverters = new Set();
        const newAlerts = [];

        for (const reading of recentReadings) {
            const inverterId = reading.inverter_id;
            
            // Only process the latest reading per inverter
            if (processedInverters.has(inverterId)) {
                continue;
            }
            
            processedInverters.add(inverterId);

            let alertNeeded = false;
            let severity = '';
            let type = '';
            let message = '';

            const { temperature, efficiency, power_kw, inverters } = reading;
            
            // We consider 'daytime' broadly as being between 6AM and 6PM local time
            // If the user's timezone differs, this logic can be refined
            const currentHour = new Date(reading.timestamp).getHours();
            const isDaytime = currentHour >= 6 && currentHour <= 18;

            if (temperature > 75) {
                alertNeeded = true;
                severity = 'High';
                type = 'Critical';
                message = `Inverter ${inverters.name || inverterId} overheating. Temperature exactly at ${temperature}°C.`;
            } else if (power_kw === 0 && isDaytime) {
                alertNeeded = true;
                severity = 'High';
                type = 'Critical';
                message = `Inverter ${inverters.name || inverterId} is outputting 0kW during daylight hours.`;
            } else if (efficiency < 80) {
                alertNeeded = true;
                severity = 'Medium';
                type = 'Underperforming';
                message = `Inverter ${inverters.name || inverterId} underperforming. Efficiency at ${efficiency}%.`;
            }

            if (alertNeeded) {
                // Check if an identical unresolved alert already exists to prevent spam
                const { data: existingAlerts } = await supabase
                    .from('alerts')
                    .select('id')
                    .eq('inverter_id', inverterId)
                    .eq('type', type)
                    .eq('is_resolved', false)
                    .limit(1);

                if (!existingAlerts || existingAlerts.length === 0) {
                     newAlerts.push({
                         inverter_id: inverterId,
                         type: type,
                         severity: severity.toLowerCase(), // schema expects 'low','medium','high','critical'
                         message: message,
                         is_resolved: false,
                         email_sent: false,
                     });
                }
            }
        }

        if (newAlerts.length > 0) {
            const { error: insertError } = await supabase
                .from('alerts')
                .insert(newAlerts);

            if (insertError) {
                console.error('Error inserting new alerts:', insertError);
            } else {
                console.log(`Successfully generated ${newAlerts.length} new alerts.`);
            }
        } else {
            console.log('No new anomalies detected.');
        }

    } catch (err) {
        console.error('Unexpected error during anomaly detection:', err);
    }
};

module.exports = {
        analyzeReadings
};
