const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendBookingEmail = async (booking, previousStatus = null) => {
  try {

    const bookingId = booking.trackingId || booking._id;

    let subject = `Booking Confirmed - ${bookingId}`;
    let title = "Booking Confirmed";

    if (previousStatus) {
      subject = `Booking Update - ${booking.status}`;
      title = "Booking Status Updated";
    }

    const html = `
      <div style="font-family:Arial">
        <h2>${title}</h2>

        <p><b>Booking ID:</b> ${bookingId}</p>
        <p><b>Status:</b> ${booking.status}</p>

        ${previousStatus ? `<p><b>Previous Status:</b> ${previousStatus}</p>` : ""}

        ${booking.adminNote ? `<p><b>Admin Note:</b> ${booking.adminNote}</p>` : ""}

        <br/>

        <p>Thank you for choosing BookMyRepair.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"BookMyRepair" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: subject,
      html: html
    });

    console.log("📧 Email sent successfully");

  } catch (error) {
    console.error("❌ Email error:", error);
  }
};

module.exports = sendBookingEmail;
