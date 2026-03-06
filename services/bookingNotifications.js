const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
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
      subject = `Booking Status Updated - ${bookingId}`;
      title = "Booking Status Updated";
    }

    const html = `
      <div style="font-family:Arial;padding:20px">
        <h2 style="color:#2c3e50">${title}</h2>

        <p><b>Booking Number:</b> ${bookingId}</p>
        <p><b>Name:</b> ${booking.name}</p>
        <p><b>Phone:</b> ${booking.phone}</p>
        <p><b>Email:</b> ${booking.email}</p>

        <hr/>

        <p><b>Device:</b> ${booking.brand} ${booking.model}</p>
        <p><b>Service:</b> ${booking.service}</p>
        <p><b>Status:</b> ${booking.status || "Pending"}</p>

        ${previousStatus ? `<p><b>Previous Status:</b> ${previousStatus}</p>` : ""}

        ${booking.adminNote ? `<p><b>Admin Note:</b> ${booking.adminNote}</p>` : ""}

        <br/>

        <p>Thank you for choosing <b>BookMyRepair</b>.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"BookMyRepair" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: subject,
      html: html
    });

    console.log("📧 Email sent successfully:", info.response);

  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};

module.exports = sendBookingEmail;
