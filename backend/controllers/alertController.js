const supabase = require('../config/supabaseClient');

// GET /api/alerts
const getAllAlerts = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error('Error fetching alerts:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve alerts.',
            error: error.message
        });
    }
};

// GET /api/alerts/critical
const getCriticalAlerts = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .eq('severity', 'high')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error('Error fetching critical alerts:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve critical alerts.',
            error: error.message
        });
    }
};

// POST /api/alerts
const createAlert = async (req, res) => {
    try {
        const { inverter_id, type, severity, message, is_resolved, email_sent } = req.body;

        const { data, error } = await supabase
            .from('alerts')
            .insert([
                {
                    inverter_id,
                    type,
                    severity,
                    message,
                    is_resolved: is_resolved || false,
                    email_sent: email_sent || false,
                }
            ])
            .select();

        if (error) throw error;

        res.status(201).json({
            status: 'success',
            data: data[0]
        });
    } catch (error) {
        console.error('Error creating alert:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create alert.',
            error: error.message
        });
    }
};

module.exports = {
    getAllAlerts,
    getCriticalAlerts,
    createAlert
};
