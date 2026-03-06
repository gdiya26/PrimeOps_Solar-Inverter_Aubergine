const express = require('express');
const router = express.Router();

// Basic health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok'
    });
});

// Mount modular sub-routes
router.use('/api/inverters', require('./inverterRoutes'));
router.use('/api/alerts', require('./alertRoutes'));

module.exports = router;
