export const emailTemplate = ({ link, linkData, subject }) => {
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
    }

    .logo svg {
      max-width: 180px;
      height: auto;
    }

    .header a {
      color: #FFFFFF;
      font-size: 13px;
      text-decoration: underline;
      display: inline-block;
      margin-top: 10px;
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

    .footer {
      padding: 20px;
      text-align: center;
      font-size: 14px;
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
      <div class="logo">
        <!-- MACC SVG LOGO -->
        <svg width="180" height="99" viewBox="0 0 180 99" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0)">
            <path d="M131.72 68.75L130.641 65.8774L129.576 68.75H131.72Z" fill="#000"/>
            <!-- SVG PATHS SHORTENED FOR BREVITY -->
          </g>
        </svg>
      </div>

      <a href="https://your-website.com" target="_blank">View on Website</a>
    </div>

    <div class="content">
      <h1>${subject}</h1>
      <p>Please click the button below to continue.</p>
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
