const supabase = require('../config/supabaseClient');
const { getTableFromBlock } = require('../utils/blockMapper');

const getDashboardStats = async (req, res) => {
    try {
        const { block } = req.query; // 'A', 'B', etc.

        let inverterIds = null;

        // Step 1: If a block filter is set, resolve the solar_table_id first
        if (block && block !== 'All') {
            const tableName = getTableFromBlock(block);
            if (!tableName) {
                return res.status(200).json({
                    status: 'success',
                    data: { totalInverters: 0, activeInverters: 0, criticalAlerts: 0, underperformingInverters: 0, totalPowerToday: 0 }
                });
            }

            // Look up the solar_table row by name
            const { data: tableRow, error: tableError } = await supabase
                .from('solar_tables')
                .select('id')
                .eq('name', tableName)
                .single();

            if (tableError || !tableRow) {
                console.error('Block table not found:', tableName, tableError);
                return res.status(200).json({
                    status: 'success',
                    data: { totalInverters: 0, activeInverters: 0, criticalAlerts: 0, underperformingInverters: 0, totalPowerToday: 0 }
                });
            }

            // Step 2: Fetch inverters for this solar_table_id
            const { data: inverters, error: inverterError } = await supabase
                .from('inverters')
                .select('id, status')
                .eq('solar_table_id', tableRow.id);

            if (inverterError) throw inverterError;
            inverterIds = inverters.map(inv => inv.id);

            const totalInverters = inverters.length;
            const activeInverters = inverters.filter(inv =>
                inv.status?.toLowerCase() === 'active' || inv.status?.toLowerCase() === 'online'
            ).length;

            // Alerts for these inverters
            let criticalAlerts = 0;
            let underperformingInverters = 0;
            if (inverterIds.length > 0) {
                const { data: alerts, error: alertsError } = await supabase
                    .from('alerts')
                    .select('id, type')
                    .in('inverter_id', inverterIds)
                    .eq('is_resolved', false);
                if (alertsError) throw alertsError;
                criticalAlerts = alerts.filter(a => a.type?.toLowerCase() === 'critical').length;
                underperformingInverters = alerts.filter(a => a.type?.toLowerCase() === 'underperforming').length;
            }

            // Total Power from latest reading per inverter
            let totalPowerKW = 0;
            if (inverterIds.length > 0) {
                const { data: readings, error: readingsError } = await supabase
                    .from('inverter_readings')
                    .select('inverter_id, power')
                    .in('inverter_id', inverterIds)
                    .order('timestamp', { ascending: false });
                if (readingsError) throw readingsError;
                const seen = new Set();
                for (const r of (readings || [])) {
                    if (!seen.has(r.inverter_id)) {
                        seen.add(r.inverter_id);
                        totalPowerKW += Number(r.power) || 0;
                    }
                }
            }

            return res.status(200).json({
                status: 'success',
                data: { totalInverters, activeInverters, criticalAlerts, underperformingInverters, totalPowerToday: parseFloat(totalPowerKW.toFixed(2)) }
            });
        }

        // No block filter — fetch ALL inverters
        const { data: inverters, error: inverterError } = await supabase
            .from('inverters')
            .select('id, status');
        if (inverterError) throw inverterError;

        const totalInverters = inverters.length;
        const activeInverters = inverters.filter(inv =>
            inv.status?.toLowerCase() === 'active' || inv.status?.toLowerCase() === 'online'
        ).length;
        const allIds = inverters.map(inv => inv.id);

        let criticalAlerts = 0;
        let underperformingInverters = 0;
        if (allIds.length > 0) {
            const { data: alerts, error: alertsError } = await supabase
                .from('alerts')
                .select('id, type')
                .in('inverter_id', allIds)
                .eq('is_resolved', false);
            if (alertsError) throw alertsError;
            criticalAlerts = alerts.filter(a => a.type?.toLowerCase() === 'critical').length;
            underperformingInverters = alerts.filter(a => a.type?.toLowerCase() === 'underperforming').length;
        }

        let totalPowerKW = 0;
        if (allIds.length > 0) {
            const { data: readings, error: readingsError } = await supabase
                .from('inverter_readings')
                .select('inverter_id, power')
                .in('inverter_id', allIds)
                .order('timestamp', { ascending: false });
            if (readingsError) throw readingsError;
            const seen = new Set();
            for (const r of (readings || [])) {
                if (!seen.has(r.inverter_id)) {
                    seen.add(r.inverter_id);
                    totalPowerKW += Number(r.power) || 0;
                }
            }
        }

        return res.status(200).json({
            status: 'success',
            data: { totalInverters, activeInverters, criticalAlerts, underperformingInverters, totalPowerToday: parseFloat(totalPowerKW.toFixed(2)) }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve dashboard statistics'
        });
    }
};

const getTelemetryData = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('plant1_1')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(20);

        if (error) throw error;

        // Process data for charts
        // We will send back the raw data and let the frontend format it, or format it here.
        // Let's format it here to match the frontend expects: powerData, voltageData, temperatureData
        
        // Reverse to get chronological order for charts
        const reversedData = [...data].reverse();

        const powerData = reversedData.map(row => {
            const time = new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            // Sum power across all inverters (0 to 11)
            let totalPower = 0;
            for (let i = 0; i < 12; i++) {
                totalPower += Number(row[`inverters[${i}].power`] || 0);
            }
            return { time, power: totalPower };
        });

        const voltageData = reversedData.map(row => {
            const time = new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
                time,
                inv1: row['inverters[0].v_ab'] || 0,
                inv2: row['inverters[1].v_ab'] || 0,
                inv3: row['inverters[2].v_ab'] || 0,
                inv4: row['inverters[3].v_ab'] || 0,
            };
        });

        // For temperature, just use the latest row
        const latestRow = data[0] || {};
        const temperatureData = [];
        for (let i = 0; i < 8; i++) {
            const temp = latestRow[`inverters[${i}].temp`] || 0;
            let status = 'normal';
            if (temp > 65) status = 'critical';
            else if (temp > 55) status = 'warning';
            temperatureData.push({
                inverter: `INV-${i + 1}`,
                temp,
                status
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                powerData,
                voltageData,
                temperatureData
            }
        });

    } catch (error) {
        console.error('Error fetching telemetry data:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve telemetry data'
        });
    }
};

module.exports = { getDashboardStats, getTelemetryData };
