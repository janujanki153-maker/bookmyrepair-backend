const nodemailer = require("nodemailer");

const hasEmailConfig = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

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

const sendBookingEmail = async (booking, previousStatus = null) => {
  if (!hasEmailConfig) {
    throw new Error("Email configuration is missing (EMAIL_USER / EMAIL_PASS)");
  }

  const toEmail = typeof booking?.email === "string" ? booking.email.trim() : "";
  if (!toEmail) {
    throw new Error("Booking email is missing");
  }

  const bookingId = booking.trackingId || booking._id;
  let subject = `Your Booking Is Confirmed - ${bookingId}`;
  let title = "Booking Confirmed";

  if (previousStatus) {
    subject = `Your Booking Status Updated - ${bookingId}`;
    title = "Booking Status Updated";
  }

  const html = `
      <div style="font-family:Arial;padding:20px">
        <h2 style="color:#2c3e50">${title}</h2>
        <p style="background:#e8f7ef;padding:10px;border-radius:8px;color:#1e7d46">
          Hello ${booking.name}, your booking request has been confirmed successfully.
        </p>

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

        <p>Please keep your booking number safe for tracking.</p>
        <p>Thank you for choosing <b>BookMyRepair</b>.</p>
      </div>
    `;

  const info = await transporter.sendMail({
    from: `"BookMyRepair" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    text: `Hello ${booking.name}, your booking is confirmed. Booking Number: ${bookingId}. Status: ${booking.status || "Pending"}. Thank you for choosing BookMyRepair.`,
    html,
  });

  console.log("Email sent successfully:", info.response || info.messageId);
  return info;
};

module.exports = sendBookingEmail;
