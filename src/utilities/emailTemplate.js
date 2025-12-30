export const emailTemplate = ({ link, linkData, subject }) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
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
    }

    .header h2 {
      margin: 0;
      font-size: 26px;
      letter-spacing: 1px;
    }

    .header a {
      color: #FFFFFF;
      font-size: 13px;
      text-decoration: underline;
      display: inline-block;
      margin-top: 8px;
    }

    .content {
      padding: 35px 30px;
      text-align: center;
      color: #787878;
    }

    .content h1 {
      color: #15AC9E;
      margin-bottom: 15px;
      font-size: 24px;
    }

    .content p {
      font-size: 16px;
      line-height: 1.6;
    }

    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #15AC9E;
      color: #FFFFFF !important;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 25px;
      font-weight: bold;
      font-size: 15px;
    }

    .button:hover {
      opacity: 0.9;
    }

    .footer {
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #787878;
      background-color: #F7F7F7;
      border-top: 1px solid #E5E5E5;
    }

    a {
      color: #15AC9E;
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
      <h2>MACC</h2>
      <a href="https://your-website.com" target="_blank">View on Website</a>
    </div>

    <div class="content">
      <h1>${subject}</h1>
      <p>
        Please click the button below to continue.
      </p>
      <a href="${link}" class="button">${linkData}</a>
    </div>

    <div class="footer">
      Stay connected with us<br/>
      &copy; ${new Date().getFullYear()} MACC. All rights reserved.
    </div>

  </div>
</body>
</html>`;
};
