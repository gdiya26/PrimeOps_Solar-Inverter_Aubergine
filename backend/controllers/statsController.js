const supabase = require('../config/supabaseClient');
const { getTableFromBlock, getTelemetryTableFromBlock, getAllTelemetryTables, getAllowedTables } = require('../utils/blockMapper');

const getDashboardStats = async (req, res) => {
    try {
        const { block } = req.query;

        // Step 1: Count inverters from structural tables
        let inverters = [];
        if (block && block !== 'All') {
            const tableName = getTableFromBlock(block);
            if (!tableName) {
                return res.status(200).json({
                    status: 'success',
                    data: { totalInverters: 0, activeInverters: 0, criticalAlerts: 0, underperformingInverters: 0, totalPowerToday: 0 }
                });
            }
            const { data: tableRow } = await supabase.from('solar_tables').select('id').eq('name', tableName).single();
            if (tableRow) {
                const { data } = await supabase.from('inverters').select('id, status').eq('solar_table_id', tableRow.id);
                inverters = data || [];
            }
        } else {
            const allowedTables = getAllowedTables();
            const { data: tables } = await supabase.from('solar_tables').select('id').in('name', allowedTables);
            const tableIds = tables?.map(t => t.id) || [];
            if (tableIds.length > 0) {
                const { data } = await supabase.from('inverters').select('id, status').in('solar_table_id', tableIds);
                inverters = data || [];
            }
        }

        const totalInverters = inverters.length;
        const activeInverters = inverters.filter(inv =>
            inv.status?.toLowerCase() === 'active' || inv.status?.toLowerCase() === 'online'
        ).length;

        // Step 2: Compute total power from plantX_Y telemetry tables (NOT from empty inverter_readings)
        let totalPowerKW = 0;
        let criticalAlerts = 0;
        let underperformingInverters = 0;

        let tablesToQuery = [];
        if (block && block !== 'All') {
            const t = getTelemetryTableFromBlock(block);
            if (t) tablesToQuery = [t];
        } else {
            tablesToQuery = getAllTelemetryTables();
        }

        for (const table of tablesToQuery) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .order('timestamp', { ascending: false })
                    .limit(1);
                
                if (error || !data || data.length === 0) continue;
                const row = data[0];

                // Sum power across all inverters in this table
                const powerKeys = Object.keys(row).filter(k => k.match(/^inverters\[\d+\]\.power$/));
                for (const key of powerKeys) {
                    const power = Number(row[key] || 0);
                    totalPowerKW += power;
                }

                // Detect anomalies from live telemetry for alert counts
                const tempKeys = Object.keys(row).filter(k => k.match(/^inverters\[\d+\]\.temp$/));
                for (let i = 0; i < tempKeys.length; i++) {
                    const temp = Number(row[`inverters[${i}].temp`] || 0);
                    const power = Number(row[`inverters[${i}].power`] || 0);
                    if (temp > 85) criticalAlerts++;
                    if (power === 0 && temp > 0) underperformingInverters++;
                }
            } catch (e) {
                continue;
            }
        }

        return res.status(200).json({
            status: 'success',
            data: {
                totalInverters,
                activeInverters,
                criticalAlerts,
                underperformingInverters,
                totalPowerToday: parseFloat(totalPowerKW.toFixed(2))
            }
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
        const { block } = req.query;
        const { getTelemetryTableFromBlock, getAllTelemetryTables } = require('../utils/blockMapper');

        // Determine which telemetry tables to query
        let tablesToQuery = [];
        if (block && block !== 'All') {
            const t = getTelemetryTableFromBlock(block);
            if (t) tablesToQuery = [t];
        } else {
            tablesToQuery = getAllTelemetryTables();
        }

        if (tablesToQuery.length === 0) {
            return res.status(200).json({ status: 'success', data: { powerData: [], voltageData: [], temperatureData: [] } });
        }

        // Fetch latest 20 rows from the first matching table (for charts)
        const primaryTable = tablesToQuery[0];
        const { data, error } = await supabase
            .from(primaryTable)
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(20);

        if (error) throw error;

        // Count how many inverters exist in this table dynamically
        const sampleRow = data && data.length > 0 ? data[0] : {};
        const inverterKeys = Object.keys(sampleRow).filter(k => k.match(/^inverters\[\d+\]\.power$/));
        const numInverters = inverterKeys.length;

        const reversedData = [...(data || [])].reverse();

        const powerData = reversedData.map(row => {
            const time = new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let totalPower = 0;
            for (let i = 0; i < numInverters; i++) {
                totalPower += Number(row[`inverters[${i}].power`] || 0);
            }
            return { time, power: parseFloat(totalPower.toFixed(2)) };
        });

        // Show voltage for first 4 inverters (or fewer if less exist)
        const voltageCount = Math.min(numInverters, 4);
        const voltageData = reversedData.map(row => {
            const time = new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const entry = { time };
            for (let i = 0; i < voltageCount; i++) {
                entry[`inv${i + 1}`] = Number(row[`inverters[${i}].v_ab`] || 0);
            }
            return entry;
        });

        // Temperature for all inverters in the latest row
        const latestRow = data && data.length > 0 ? data[0] : {};
        const temperatureData = [];
        for (let i = 0; i < numInverters; i++) {
            const temp = Number(latestRow[`inverters[${i}].temp`] || 0);
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

// GET /api/stats/inverter-telemetry?block=A
// Returns per-inverter live metrics (temp, power, voltage, efficiency) from the plantX_Y tables
const getInverterTelemetry = async (req, res) => {
    try {
        const { block } = req.query;
        const { getTelemetryTableFromBlock, getAllTelemetryTables } = require('../utils/blockMapper');

        let tablesToQuery = [];
        if (block && block !== 'All') {
            const t = getTelemetryTableFromBlock(block);
            if (t) tablesToQuery = [t];
        } else {
            tablesToQuery = getAllTelemetryTables();
        }

        if (tablesToQuery.length === 0) {
            return res.status(200).json({ status: 'success', data: [] });
        }

        let allInverterMetrics = [];

        for (const table of tablesToQuery) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(1);

            if (error || !data || data.length === 0) continue;

            const row = data[0];
            // Dynamically detect how many inverters exist
            const powerKeys = Object.keys(row).filter(k => k.match(/^inverters\[\d+\]\.power$/));

            for (let i = 0; i < powerKeys.length; i++) {
                const temp = Number(row[`inverters[${i}].temp`] || 0);
                const power = Number(row[`inverters[${i}].power`] || 0);
                const v_ab = Number(row[`inverters[${i}].v_ab`] || 0);
                const efficiency = Number(row['Efficiency'] || 0);
                const effPercent = efficiency <= 1 ? efficiency * 100 : efficiency;
                const ambientTemp = Number(row['ambient_temp'] || 0);

                let health = 'healthy';
                if (temp > 85 || power === 0) health = 'critical';
                else if (temp > 75 || power < 10) health = 'warning';

                const riskScore = temp > 85 ? 85 : (temp > 75 ? 55 : Math.min(Math.round(temp * 0.5), 30));

                // Reverse-lookup the block letter from the table name
                const telemetryToBlock = {};
                for (const [blk, tbl] of Object.entries(require('../utils/blockMapper').blockToTelemetryTable)) {
                    telemetryToBlock[tbl] = blk;
                }

                allInverterMetrics.push({
                    tableSource: table,
                    block: telemetryToBlock[table] || '?',
                    inverterIndex: i,
                    temperature: parseFloat(temp.toFixed(1)),
                    powerOutput: parseFloat(power.toFixed(2)),
                    voltage: parseFloat(v_ab.toFixed(1)),
                    efficiency: parseFloat(effPercent.toFixed(1)),
                    ambientTemp: parseFloat(ambientTemp.toFixed(1)),
                    health,
                    riskScore
                });
            }
        }

        return res.status(200).json({ status: 'success', data: allInverterMetrics });
    } catch (error) {
        console.error('Error fetching inverter telemetry:', error);
        return res.status(500).json({ status: 'error', message: 'Failed to retrieve inverter telemetry' });
    }
};

module.exports = { getDashboardStats, getTelemetryData, getInverterTelemetry };
