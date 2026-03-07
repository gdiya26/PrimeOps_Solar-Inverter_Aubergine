require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendAlertEmail = async (alerts) => {
    if (!alerts || alerts.length === 0) {
        console.log('No alerts to send.');
        return;
    }

    const alertDetails = alerts.map((alert, index) =>
        `${index + 1}. [${alert.severity.toUpperCase()}] ${alert.type} - ${alert.message} (Inverter ID: ${alert.inverter_id || 'Unknown'})`
    ).join('\n');

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECIPIENT,
        subject: 'Daily Solar Inverter Alerts',
        text: `Here are the latest solar inverter alerts:\n\n${alertDetails}\n\nPlease review these issues in the dashboard.\n\nSolar Monitoring System`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Alert email sent successfully: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending alert email:', error);
        throw error;
    }
};

module.exports = {
    sendAlertEmail
};
