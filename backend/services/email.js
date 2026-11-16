const { sendMailSafe } = require('./mailSender');
const {
  orderConfirmationEmail,
  popNotificationEmail,
  paymentReminderEmail,
} = require('../utils/emailTemplates');

async function sendOrderConfirmation(order) {
  const { subject, html } = orderConfirmationEmail(order);
  await sendMailSafe({ to: order.customer.email, subject, html });
}

async function sendPOPNotification(order) {
  const { subject, html } = popNotificationEmail(order);
  await sendMailSafe({ to: process.env.ADMIN_EMAIL, subject, html });
}

// Manual admin action: returns true/false and doesn't queue, so a retry can't send a duplicate
async function sendPaymentReminder(order) {
  const { subject, html } = paymentReminderEmail(order);
  return sendMailSafe({ to: order.customer.email, subject, html, queueOnFail: false });
}

module.exports = { sendOrderConfirmation, sendPOPNotification, sendPaymentReminder };