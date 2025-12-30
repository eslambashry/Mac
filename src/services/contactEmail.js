import nodemailer from 'nodemailer'


export const sendContactUsEmailService = async ({ name, email, message }) => {
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
    from: `"${name}" <${email}>`,
    to: process.env.OWNER || "samyragab511@gmail.com", // owner email
    subject: "New Contact Us Message",
    html: `
      <h2>New Message from Contact Us Form</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <br/>
      <small style="color:gray;">Sent automatically from your website.</small>
    `,
  };

  await transporter.sendMail(mailOptions);

  return true;
};
