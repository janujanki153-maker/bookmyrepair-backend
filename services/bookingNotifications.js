const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 20000
});

const sendBookingEmail = async (booking) => {
  try {

    const bookingId = booking.trackingId || booking._id;

    const html = `
      <div style="font-family:Arial">
        <h2>Booking Confirmed</h2>

        <p><b>Booking ID:</b> ${bookingId}</p>
        <p><b>Name:</b> ${booking.name}</p>
        <p><b>Phone:</b> ${booking.phone}</p>
        <p><b>Device:</b> ${booking.brand} ${booking.model}</p>
        <p><b>Service:</b> ${booking.service}</p>
        <p><b>Status:</b> ${booking.status || "Pending"}</p>

        <br/>

        <p>Thank you for choosing <b>BookMyRepair</b>.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"BookMyRepair" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `Booking Confirmed - ${bookingId}`,
      html: html
    });

    console.log("📧 Email sent successfully");

  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};

module.exports = sendBookingEmail;
