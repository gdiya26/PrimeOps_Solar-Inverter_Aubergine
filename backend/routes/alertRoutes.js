const express = require('express');
const router = express.Router();
const {
    getAllAlerts,
    getCriticalAlerts,
    createAlert,
    getTelemetryAlerts
} = require('../controllers/alertController');

// GET /api/alerts/critical
router.get('/critical', getCriticalAlerts);

// GET /api/alerts/telemetry
router.get('/telemetry', getTelemetryAlerts);

// GET /api/alerts
router.get('/', getAllAlerts);

// POST /api/alerts
router.post('/', createAlert);

module.exports = router;
