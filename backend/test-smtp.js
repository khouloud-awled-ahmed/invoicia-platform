require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.sendMail({
  from: `"Invoicia Test" <${process.env.SMTP_USER}>`,
  to: process.env.PLATFORM_ADMIN_EMAIL,
  subject: 'Test SMTP Invoicia',
  text: 'Si tu reçois ça, Brevo fonctionne correctement.',
}).then(info => {
  console.log('SUCCESS:', info.response);
}).catch(err => {
  console.error('FAILED:', err.message);
});
