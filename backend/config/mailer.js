const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Bypasses the self-signed certificate check
    rejectUnauthorized: false,
  },
});

// Verify connection on startup
transporter.verify((err) => {
  if (err) {
    console.warn('[Mailer] SMTP connection failed:', err.message);
  } else {
    console.log('[Mailer] SMTP ready');
  }
});

module.exports = transporter;