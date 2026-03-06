require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request Logging
const morgan = require('morgan');
app.use(morgan('dev'));

// Routes import
const routes = require('./routes/index');
app.use('/', routes);

// Import Cron Jobs
require('./jobs/dailyAlertJob');
require('./jobs/inverterMonitoringJob');

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: 'error', message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
