// utils/otpSender.js

const nodemailer = require('nodemailer');
// const smsProvider = require('your-sms-provider-sdk'); // Example for SMS

const sendEmailOTP = async (email, otp) => {
    // Use nodemailer or any mail service
    let transporter = nodemailer.createTransport({
        service: 'Gmail', // or Mailgun, etc.
        auth: {
            user: 'vinothini1.deecodes@gmail.com',
            pass: 'fksv xyol plxg gcsv',
        },
    });

    let mailOptions = {
        from: 'vinothini1.deecodes@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
};

const sendSMSOTP = async (phone, otp) => {
    // Use SMS API like Twilio
    console.log(`Send OTP ${otp} to phone ${phone}`);
    // Example:
    // await smsProvider.messages.create({ to: phone, body: `Your OTP is ${otp}` });
};

module.exports = { sendEmailOTP, sendSMSOTP };
