const supabase = require('../config/supabaseClient');

// GET /api/inverters
const getAllInverters = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('inverters')
            .select('*');

        if (error) throw error;

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error('Error fetching inverters:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve inverters.',
            error: error.message
        });
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

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error(`Error fetching inverter ${req.params.id}:`, error.message);
        res.status(500).json({
            status: 'error',
            message: `Failed to retrieve inverter with ID ${req.params.id}.`,
            error: error.message
        });
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

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error(`Error fetching readings for inverter ${req.params.id}:`, error.message);
        res.status(500).json({
            status: 'error',
            message: `Failed to retrieve readings for inverter ID ${req.params.id}.`,
            error: error.message
        });
    }
};

module.exports = {
    getAllInverters,
    getInverterById,
    getInverterReadings
};
