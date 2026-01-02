export const contactUsEmailTemplate = ({
  fullName,
  companyName,
  companyEmail,
  phoneNumber,
  message,
}) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #FFFFFF;
    }

    .email-container {
      width: 60%;
      margin: 30px auto;
      background-color: #FFFFFF;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .header {
      background-color: #15AC9E;
      padding: 25px;
      text-align: center;
      color: #FFFFFF;
      font-size: 22px;
      font-weight: bold;
    }

    .content {
      padding: 35px 30px;
      color: #333333;
    }

    .content h2 {
      color: #15AC9E;
      margin-bottom: 20px;
      text-align: center;
    }

    .info {
      margin-bottom: 12px;
      font-size: 15px;
    }

    .label {
      font-weight: bold;
      color: #555555;
    }

    .message-box {
      margin-top: 20px;
      padding: 15px;
      background-color: #F7F7F7;
      border-radius: 6px;
      font-size: 15px;
      line-height: 1.6;
    }

    .footer {
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #787878;
      background-color: #F7F7F7;
      border-top: 1px solid #E5E5E5;
    }

    @media (max-width: 768px) {
      .email-container {
        width: 95%;
      }
    }
  </style>
</head>

<body>
  <div class="email-container">

    <div class="header">
      New Contact Us Message
    </div>

    <div class="content">
      <h2>Contact Details</h2>

      <div class="info">
        <span class="label">Full Name:</span> ${fullName}
      </div>

      <div class="info">
        <span class="label">Company Name:</span> ${companyName || '-'}
      </div>

      <div class="info">
        <span class="label">Email:</span> ${companyEmail}
      </div>

      <div class="info">
        <span class="label">Phone Number:</span> ${phoneNumber}
      </div>

      <div class="message-box">
        <strong>Message:</strong><br/>
        ${message}
      </div>
    </div>

    <div class="footer">
      Sent automatically from your website<br/>
      &copy; ${new Date().getFullYear()} MACC. All rights reserved.
    </div>

  </div>
</body>
</html>`;
};
