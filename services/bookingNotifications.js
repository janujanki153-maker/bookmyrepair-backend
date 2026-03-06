const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendBookingEmail = async (booking) => {
  try {

    const bookingId = booking.trackingId || booking._id;

    await transporter.sendMail({
      from: `"BookMyRepair" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `Booking Confirmed - ${bookingId}`,
      html: `
        <h2>Booking Confirmed</h2>
        <p><b>Booking ID:</b> ${bookingId}</p>
        <p><b>Name:</b> ${booking.name}</p>
        <p><b>Phone:</b> ${booking.phone}</p>
        <p><b>Device:</b> ${booking.brand} ${booking.model}</p>
        <p><b>Service:</b> ${booking.service}</p>
      `
    });

    console.log("📧 Email Sent");

  } catch (error) {
    console.log("❌ Email Error:", error.message);
  }
};

module.exports = sendBookingEmail;
