const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingEmail = async (booking) => {
  const toEmail = typeof booking?.email === "string" ? booking.email.trim() : "";
  if (!toEmail) throw new Error("Booking email is missing");

  const bookingId = booking.trackingId || booking._id;

  await transporter.sendMail({
    from: `"BookMyRepair" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Booking Confirmed - ${bookingId}`,
    html: `
      <h2>Booking Confirmed</h2>
      <p><b>Booking ID:</b> ${bookingId}</p>
      <p><b>Name:</b> ${booking.name}</p>
      <p><b>Phone:</b> ${booking.phone}</p>
      <p><b>Service:</b> ${booking.service}</p>
    `,
  });

  console.log("Email sent");
};

module.exports = sendBookingEmail;
