// services/emailService.js

const nodemailer = require('nodemailer');

// Create a transporter outside the function for reuse
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendConfirmationEmail = async (to, bookingDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Hotel Booking Confirmation',
    html: `
      <h1>Booking Confirmation</h1>
      <p>Thank you for your booking. Here are your details:</p>
      <ul>
        <li>Room ID: ${bookingDetails.roomId}</li>
        <li>Full Name: ${bookingDetails.fullName}</li>
        <li>Email: ${bookingDetails.email}</li>
        <li>Nights: ${bookingDetails.nights}</li>
      </ul>
      <p>We look forward to your stay!</p>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully');
    console.log('Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Add a function to verify email configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('Email configuration is correct');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

module.exports = { sendConfirmationEmail, verifyEmailConfig };