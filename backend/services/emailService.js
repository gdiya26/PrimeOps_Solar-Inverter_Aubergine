const nodemailer = require('nodemailer');

const sendAlertEmail = async (alerts) => {
    try {
        if (!alerts || alerts.length === 0) {
            console.log('No alerts to send.');
            return;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let emailText = 'The following alerts were generated:\n\n';
        alerts.forEach((alert, index) => {
            emailText += `--- Alert ${index + 1} ---\n`;
            for (const [key, value] of Object.entries(alert)) {
                emailText += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
            }
            emailText += '\n';
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECIPIENT,
            subject: 'Daily Solar Inverter Alerts',
            text: emailText
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Alert email sent successfully:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending alert email:', error);
        throw error;
    }
};

module.exports = {
    sendAlertEmail
};
