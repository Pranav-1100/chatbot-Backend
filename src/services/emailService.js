const nodeMailer = require('nodemailer');
require('dotenv').config();
async function sendMail(userEmail, subject, text) {

    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD
        }

    });
    const mailoption = {
        from: process.env.AUTH_EMAIL,
        to: userEmail,
        subject: subject,
        text:text,
    };
    try {
        await transporter.sendMail(mailoption);
        console.log('Email sent');
    } catch (error) {
        console.log('Error sending email:', error);
    }
};

module.exports = sendMail;