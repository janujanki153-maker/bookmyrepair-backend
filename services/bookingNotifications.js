const nodemailer = require("nodemailer");

// Gmail transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send booking email
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
      <div style="font-family:Arial;max-width:600px">

        <h2>${title}</h2>

        <p><b>Booking ID:</b> ${bookingId}</p>
        <p><b>Name:</b> ${booking.name}</p>
        <p><b>Phone:</b> ${booking.phone}</p>
        <p><b>Email:</b> ${booking.email}</p>

        <p><b>Device:</b> ${booking.brand} ${booking.model}</p>

        <p><b>Service:</b> ${booking.service}</p>

        <p><b>Pickup Type:</b> ${booking.pickupOption}</p>

        <p><b>Address:</b> ${booking.address}</p>

        <p><b>Status:</b> ${booking.status || "Pending"}</p>

        ${previousStatus ? `<p><b>Previous Status:</b> ${previousStatus}</p>` : ""}

        ${booking.adminNote ? `<p><b>Admin Note:</b> ${booking.adminNote}</p>` : ""}

        <br/>

        <p>Thank you for choosing <b>BookMyRepair</b>.</p>

      </div>
    `;

    await transporter.sendMail({
      from: `"BookMyRepair" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: subject,
      html: html
    });

    console.log("📧 Booking email sent");

  } catch (error) {

    console.error("❌ Email error:", error.message);

  }

};

module.exports = sendBookingEmail;
