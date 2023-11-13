const mailer = require("nodemailer");
const welcome = require("./welcome_template");
const goodbye = require("./goodbye_template");
const getEmailData = (to, name, template) => {
  let data = null;

  switch (template) {
    case "welcome":
      data = {
        from: "보내는 사람<userId@gmail.com>",
        to,
        subject: `Hello ${name}`,
        html: welcome(),
      };
      break;

    case "goodbye":
      data = {
        from: "보내는 사람<userId@gmail.com>",
        to,
        subject: `Goodbye ${name}`,
        html: goodbye(),
      };
      break;

    default:
      data;
  }
  return data;
};

const sendMail = () => {
  const transporter = mailer.createTransporter({
    service: "Gmail",
    auth: {
      user: "gpfla5503@gmail.com",
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mail = getEmailData(to, nama, type);

  transporter.sendEmail(mail, (error, response) => {
    if (error) {
      console.log(error);
    } else {
      console.log("email sent successfully");
    }
    transporter.close();
  });
};

module.exports = sendMail;
