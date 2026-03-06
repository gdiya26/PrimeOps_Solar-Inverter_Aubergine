const supabase = require('../config/supabaseClient');
const { getTableFromBlock } = require('../utils/blockMapper');

// Helper: resolve inverter IDs for a given block
const getInverterIdsForBlock = async (block) => {
    if (!block || block === 'All') return null; // null = no filter

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

module.exports = { getAllAlerts, getCriticalAlerts, createAlert };
