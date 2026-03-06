const { Resend } = require("resend");

const resend = new Resend(process.env.re_NPcjc6MT_E3jUEsjKhjRCWQYi3ny5qzTe);

const sendBookingEmail = async (booking, previousStatus = null) => {
  const toEmail = (booking?.email || "").trim();
  if (!toEmail) throw new Error("Booking email is missing");
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");
  if (!process.env.EMAIL_FROM) throw new Error("EMAIL_FROM missing");

  const bookingId = booking.trackingId || booking._id;
  const subject = previousStatus
    ? `Your Booking Status Updated - ${bookingId}`
    : `Your Booking Is Confirmed - ${bookingId}`;

  const html = `
    <h2>${previousStatus ? "Booking Status Updated" : "Booking Confirmed"}</h2>
    <p>Hello ${booking.name}, your booking is confirmed.</p>
    <p><b>Booking Number:</b> ${bookingId}</p>
    <p><b>Phone:</b> ${booking.phone}</p>
    <p><b>Service:</b> ${booking.service}</p>
    <p><b>Status:</b> ${booking.status || "Pending"}</p>
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
