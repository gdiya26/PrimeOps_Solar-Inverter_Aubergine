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
router.use('/api/stats', require('./statsRoutes'));
router.use('/api/chat', require('./chatRoutes'));

module.exports = router;
