//e-mail client receipt and confirmation
require('dotenv').config({path: '../../.env'})
const nodemailer = require('nodemailer');
//const smtpTransport = require("nodemailer-smtp-transport");
const { pugEngine } = require("nodemailer-pug-engine");
const host = process.env.host;
const user = process.env.email;
const pass = process.env.emailpass;

const smtpConfig = {
    host: host,
    port: 465,
    secure: true, // use SSL
    auth: {
        user: user,
        pass: pass
    }
};

// create reusable transporter object using the default SMTP transport
//const transporter = nodemailer.createTransport(smtpTransport(smtpConfig));
const transporter = nodemailer.createTransport(smtpConfig);

transporter.use('compile', pugEngine({
    templateDir: __dirname + '/views/emails',
    pretty: true
}));

// verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.warn(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

exports.sendmail = function (sale) {
  console.log(sale);
  let mailOptions = {
      from: '"Porches Pottery" <info@porchespottery.com>', // sender address
      to:  sale[0].clientDetails.email, // list of receivers
      bcc: '"Porches Pottery" <info@porchespottery.com>',
      subject: 'Your order confirmation from Porches Pottery.', // Subject line
      template: 'confirmOrder',
      ctx: sale

  };

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.warn(error);
    }
    console.log('Message sent: ' + info.response);
});
};
