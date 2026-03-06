const express = require('express');
const router = express.Router();
const {
    getAllInverters,
    getInverterById,
    getInverterReadings
} = require('../controllers/inverterController');

// GET /api/inverters
router.get('/', getAllInverters);

// GET /api/inverters/:id
router.get('/:id', getInverterById);

// GET /api/inverters/:id/readings
router.get('/:id/readings', getInverterReadings);

module.exports = router;
