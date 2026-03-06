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

    await transporter.sendMail({
      from: `"BookMyRepair" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `Booking Confirmed - ${bookingId}`,
      html: `
        <h2>Booking Confirmed</h2>
        <p><b>Booking ID:</b> ${bookingId}</p>
        <p><b>Name:</b> ${booking.name}</p>
        <p><b>Phone:</b> ${booking.phone}</p>
        <p><b>Service:</b> ${booking.service}</p>
      `
    });

    console.log("📧 Email sent");

  } catch (error) {

    console.log("❌ Email error:", error);

  }

};

module.exports = sendBookingEmail;
