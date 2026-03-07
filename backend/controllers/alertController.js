const supabase = require('../config/supabaseClient');
const { getTableFromBlock } = require('../utils/blockMapper');

// Helper: resolve inverter IDs for a given block
const getInverterIdsForBlock = async (block) => {
    const { getTableFromBlock, getAllowedTables } = require('../utils/blockMapper');

    if (!block || block === 'All') {
        const { data: tables } = await supabase.from('solar_tables').select('id').in('name', getAllowedTables());
        const tableIds = tables?.map(t => t.id) || [];
        if (tableIds.length === 0) return [];
        
        const { data: inverters, error: invError } = await supabase
            .from('inverters')
            .select('id')
            .in('solar_table_id', tableIds);
            
        if (invError || !inverters) return [];
        return inverters.map(i => i.id);
    }

    const tableName = getTableFromBlock(block);
    if (!tableName) return [];

    const { data: tableRow, error: tableError } = await supabase
        .from('solar_tables')
        .select('id')
        .eq('name', tableName)
        .single();

    if (tableError || !tableRow) return [];

    const { data: inverters, error: invError } = await supabase
        .from('inverters')
        .select('id')
        .eq('solar_table_id', tableRow.id);

    if (invError || !inverters) return [];
    return inverters.map(i => i.id);
};

// GET /api/alerts
const getAllAlerts = async (req, res) => {
    try {
        const { block } = req.query;
        const ids = await getInverterIdsForBlock(block);

        // ids === null means no filter, ids === [] means no inverters found for block
        if (Array.isArray(ids) && ids.length === 0) {
            return res.status(200).json({ status: 'success', data: [] });
        }

        let query = supabase.from('alerts').select('*').order('created_at', { ascending: false });
        if (ids !== null) query = query.in('inverter_id', ids);

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error('Error fetching alerts:', error.message);
        res.status(500).json({ status: 'error', message: 'Failed to retrieve alerts.', error: error.message });
    }
};

// GET /api/alerts/critical
const getCriticalAlerts = async (req, res) => {
    try {
        const { block } = req.query;
        const ids = await getInverterIdsForBlock(block);

        if (Array.isArray(ids) && ids.length === 0) {
            return res.status(200).json({ status: 'success', data: [] });
        }

        let query = supabase.from('alerts').select('*').eq('severity', 'high').order('created_at', { ascending: false });
        if (ids !== null) query = query.in('inverter_id', ids);

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error('Error fetching critical alerts:', error.message);
        res.status(500).json({ status: 'error', message: 'Failed to retrieve critical alerts.', error: error.message });
    }
};

// POST /api/alerts
const createAlert = async (req, res) => {
    try {
        const { inverter_id, type, severity, message, is_resolved, email_sent } = req.body;

        const { data, error } = await supabase
            .from('alerts')
            .insert([{ inverter_id, type, severity, message, is_resolved: is_resolved || false, email_sent: email_sent || false }])
            .select();

        if (error) throw error;

        res.status(201).json({ status: 'success', data: data[0] });
    } catch (error) {
        console.error('Error creating alert:', error.message);
        res.status(500).json({ status: 'error', message: 'Failed to create alert.', error: error.message });
    }
};

// GET /api/alerts/telemetry — generate alerts from live plantX_Y telemetry anomalies
const getTelemetryAlerts = async (req, res) => {
    try {
        const { getTelemetryTableFromBlock, getAllTelemetryTables } = require('../utils/blockMapper');
        const { block } = req.query;

        let tablesToQuery = [];
        if (block && block !== 'All') {
            const t = getTelemetryTableFromBlock(block);
            if (t) tablesToQuery = [t];
        } else {
            tablesToQuery = getAllTelemetryTables();
        }

        const alerts = [];
        for (const table of tablesToQuery) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(1);

                if (error || !data || data.length === 0) continue;
                const row = data[0];
                const timestamp = row.timestamp || new Date().toISOString();
                const powerKeys = Object.keys(row).filter(k => k.match(/^inverters\[\d+\]\.power$/));

                for (let i = 0; i < powerKeys.length; i++) {
                    const temp = Number(row[`inverters[${i}].temp`] || 0);
                    const power = Number(row[`inverters[${i}].power`] || 0);
                    const voltage = Number(row[`inverters[${i}].v_ab`] || 0);

                    if (temp > 85) {
                        alerts.push({
                            id: `tel-${table}-temp-${i}`,
                            severity: 'high',
                            type: 'Temperature Alert',
                            message: `Inverter ${i + 1} in ${table}: Critical temperature ${temp}°C`,
                            created_at: timestamp,
                            inverter_id: `${table}-inv${i}`
                        });
                    } else if (temp > 75) {
                        alerts.push({
                            id: `tel-${table}-temp-${i}`,
                            severity: 'medium',
                            type: 'Temperature Warning',
                            message: `Inverter ${i + 1} in ${table}: Temperature ${temp}°C trending high`,
                            created_at: timestamp,
                            inverter_id: `${table}-inv${i}`
                        });
                    }

                    if (power === 0 && temp > 0) {
                        alerts.push({
                            id: `tel-${table}-power-${i}`,
                            severity: 'high',
                            type: 'Power Fault',
                            message: `Inverter ${i + 1} in ${table}: Zero power output detected`,
                            created_at: timestamp,
                            inverter_id: `${table}-inv${i}`
                        });
                    }

                    if (voltage > 0 && voltage < 200) {
                        alerts.push({
                            id: `tel-${table}-volt-${i}`,
                            severity: 'medium',
                            type: 'Voltage Warning',
                            message: `Inverter ${i + 1} in ${table}: Low voltage ${voltage}V`,
                            created_at: timestamp,
                            inverter_id: `${table}-inv${i}`
                        });
                    }
                }
            } catch (e) {
                continue;
            }
        }

        res.status(200).json({ status: 'success', data: alerts });
    } catch (error) {
        console.error('Error generating telemetry alerts:', error.message);
        res.status(500).json({ status: 'error', message: 'Failed to generate telemetry alerts.' });
    }
};

module.exports = { getAllAlerts, getCriticalAlerts, createAlert, getTelemetryAlerts };
