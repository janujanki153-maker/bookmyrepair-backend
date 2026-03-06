const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);


const sendBookingEmail = async (booking, previousStatus = null) => {
  const toEmail = typeof booking?.email === "string" ? booking.email.trim() : "";
  if (!toEmail) throw new Error("Booking email is missing");
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");
  if (!process.env.EMAIL_FROM) throw new Error("EMAIL_FROM missing");

  const bookingId = booking.trackingId || booking._id;
  const isUpdate = Boolean(previousStatus);

  const subject = isUpdate
    ? `Your Booking Status Updated - ${bookingId}`
    : `Your Booking Is Confirmed - ${bookingId}`;

  const html = `
    <div style="font-family:Arial;padding:20px">
      <h2>${isUpdate ? "Booking Status Updated" : "Booking Confirmed"}</h2>
      <p>Hello ${booking.name}, your booking request has been confirmed successfully.</p>
      <p><b>Booking Number:</b> ${bookingId}</p>
      <p><b>Phone:</b> ${booking.phone}</p>
      <p><b>Email:</b> ${booking.email}</p>
      <p><b>Device:</b> ${booking.brand} ${booking.model}</p>
      <p><b>Service:</b> ${booking.service}</p>
      <p><b>Status:</b> ${booking.status || "Pending"}</p>
      ${previousStatus ? `<p><b>Previous Status:</b> ${previousStatus}</p>` : ""}
      ${booking.adminNote ? `<p><b>Admin Note:</b> ${booking.adminNote}</p>` : ""}
      <p>Thank you for choosing BookMyRepair.</p>
    </div>
  `;

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [toEmail],
    subject,
    html,
    text: `Booking ${bookingId} confirmed. Status: ${booking.status || "Pending"}`,
  });
};

module.exports = sendBookingEmail;
