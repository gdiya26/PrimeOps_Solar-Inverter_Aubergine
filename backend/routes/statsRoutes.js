const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// GET /api/stats
router.get('/', statsController.getDashboardStats);

// GET /api/stats/telemetry
router.get('/telemetry', statsController.getTelemetryData);

module.exports = router;
