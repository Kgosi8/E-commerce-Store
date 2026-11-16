const FailedEmail = require('../model/FailedEmail');

// Retried every 15 minutes, so 100 attempts is about 25 hours: long enough to outlast a daily quota
const MAX_ATTEMPTS = 100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Sends through the Apps Script relay over HTTPS (SMTP is blocked on Render's free tier)
async function deliver({ to, subject, html }) {
  const res = await fetch(process.env.MAIL_RELAY_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret:  process.env.MAIL_RELAY_SECRET,
      to,
      subject,
      html,
      name:    process.env.STORE_NAME,
    }),
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`Relay gave an unexpected reply (HTTP ${res.status}).`); }

  if (!data.ok) throw new Error(data.error || 'Relay error');
}

// Tries 3 times, then saves the email for later retry.
// Returns true if sent now, false if not.
// queueOnFail: false is for emails that go stale or are sent by hand (reset links, reminders).
async function sendMailSafe({ to, subject, html, queueOnFail = true }) {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await deliver({ to, subject, html });
      return true;
    } catch (err) {
      lastError = err;
      console.error(`[Mail] Attempt ${attempt} failed for ${to}:`, err.message);
      if (attempt < 3) await sleep(2000 * attempt);
    }
  }

  if (queueOnFail) {
    await FailedEmail.create({ to, subject, html, attempts: 3, lastError: lastError.message });
    console.warn(`[Mail] Saved for retry: ${subject} → ${to}`);
  }
  return false;
}

async function retryFailedEmails() {
  const pending = await FailedEmail.find({ status: 'pending' }).limit(20);

  for (const mail of pending) {
    try {
      await deliver(mail);
      mail.status = 'sent';
    } catch (err) {
      mail.attempts += 1;
      mail.lastError = err.message;
      if (mail.attempts >= MAX_ATTEMPTS) mail.status = 'gave_up';
    }
    await mail.save();
  }
}

module.exports = { sendMailSafe, retryFailedEmails };