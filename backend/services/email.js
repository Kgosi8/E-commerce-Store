const transporter              = require('../config/mailer');
const { orderConfirmationEmail } = require('../utils/emailTemplates');

/**
 * Sends the order confirmation email to the customer.
 * Non-fatal — logs error but does not throw so order creation still succeeds.
 *
 * @param {object} order  — the saved Mongoose order document
 */
async function sendOrderConfirmation(order) {
  try {
    const { subject, html } = orderConfirmationEmail(order);

    const info = await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      order.customer.email,
      subject,
      html,
    });

    console.log(`[Email] Confirmation sent to ${order.customer.email} — ${info.messageId}`);
  } catch (err) {
    // Log but don't crash the order — email failure is non-fatal
    console.error(`[Email] Failed to send confirmation for ${order.orderId}:`, err.message);
  }
}

module.exports = { sendOrderConfirmation };