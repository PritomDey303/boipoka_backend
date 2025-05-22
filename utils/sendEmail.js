const nodeMailer = require ('nodemailer');

const sendEmail = async (to, subject, html) => {
  const transporter = nodeMailer.createTransport ({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  await transporter.sendMail (
    {
      from: process.env.EMAIL,
      to,
      subject,
      html,
    },
    (err, info) => {
      if (err) {
        console.log (err);
      } else {
        console.log ('Email sent: ' + info.response);
      }
    }
  );
};

module.exports = sendEmail;
