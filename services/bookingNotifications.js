const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendBookingEmail = async (booking) => {
  try {

    const bookingId = booking.trackingId || booking._id;

    const html = `
      <div style="font-family:Arial">
        <h2>Booking Confirmed</h2>

        <p><b>Booking ID:</b> ${bookingId}</p>
        <p><b>Status:</b> ${booking.status}</p>

        <br/>

        <p>Thank you for choosing BookMyRepair.</p>
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
    console.error("Email error:", error);
  }
};

module.exports = sendBookingEmail;
