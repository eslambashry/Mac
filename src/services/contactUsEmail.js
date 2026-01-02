import nodemailer from 'nodemailer';
import { contactUsEmailTemplate } from '../utilities/contactUsEmailTemplate.js';

export const sendContactUsEmailService = async ({
  fullName,
  companyName,
  companyEmail,
  phoneNumber,
  message,
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"${fullName}" <${companyEmail}>`,
    to: "eslambashryy@gmail.com", // TODO this email will replace with the client email
    subject: "New Contact Us Message",
    html: contactUsEmailTemplate({
      fullName,
      companyName,
      companyEmail,
      phoneNumber,
      message,
    }),
  };

  await transporter.sendMail(mailOptions);
  return true;
};
