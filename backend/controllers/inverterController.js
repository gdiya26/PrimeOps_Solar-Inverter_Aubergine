const supabase = require('../config/supabaseClient');
const { getTableFromBlock } = require('../utils/blockMapper');

// Helper to get inverters filtered by block (or all if no block)
const getInverterQuery = async (block) => {
    if (!block || block === 'All') {
        return supabase.from('inverters').select('*');
    }
    const { getTableFromBlock } = require('../utils/blockMapper');
    const tableName = getTableFromBlock(block);
    if (!tableName) return null;

    const { data: tableRow, error: tableError } = await supabase
        .from('solar_tables')
        .select('id')
        .eq('name', tableName)
        .single();

    if (tableError || !tableRow) return null;
    return supabase.from('inverters').select('*').eq('solar_table_id', tableRow.id);
};

// GET /api/inverters
const getAllInverters = async (req, res) => {
    try {
        const { block } = req.query;

        let query;
        if (block && block !== 'All') {
            const tableName = getTableFromBlock(block);
            if (!tableName) return res.status(200).json({ status: 'success', data: [] });

            const { data: tableRow, error: tableError } = await supabase
                .from('solar_tables')
                .select('id')
                .eq('name', tableName)
                .single();

            if (tableError || !tableRow) return res.status(200).json({ status: 'success', data: [] });

            query = supabase.from('inverters').select('*').eq('solar_table_id', tableRow.id);
        } else {
            query = supabase.from('inverters').select('*');
        }

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error('Error fetching inverters:', error.message);
        res.status(500).json({ status: 'error', message: 'Failed to retrieve inverters.', error: error.message });
    }
};

// GET /api/inverters/:id
const getInverterById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('inverters')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error(`Error fetching inverter ${req.params.id}:`, error.message);
        res.status(500).json({ status: 'error', message: `Failed to retrieve inverter ${req.params.id}.`, error: error.message });
    }
};

// GET /api/inverters/:id/readings
const getInverterReadings = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('inverter_readings')
            .select('*')
            .eq('inverter_id', id)
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error(`Error fetching readings for inverter ${req.params.id}:`, error.message);
        res.status(500).json({ status: 'error', message: `Failed to retrieve readings for inverter ${req.params.id}.`, error: error.message });
    }
};

module.exports = { getAllInverters, getInverterById, getInverterReadings };
