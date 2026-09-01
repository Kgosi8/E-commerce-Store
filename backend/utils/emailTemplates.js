/**
 * All email HTML templates live here.
 * Returns { subject, html } for each email type.
 */

const STORE_NAME = process.env.STORE_NAME || 'Our Store';
const STORE_URL  = process.env.STORE_URL  || 'http://localhost:4200';

// ── Shared styles ─────────────────────────────────────────────────
const baseStyles = `
  body { margin:0; padding:0; background:#f0ede6; font-family:'Helvetica Neue',Arial,sans-serif; }
  .wrapper { max-width:580px; margin:0 auto; padding:32px 16px; }
  .card { background:#ffffff; border-radius:12px; overflow:hidden; }
  .header { background:#fdf8f1; padding:28px 32px; border-bottom:1px solid #ede7db; }
  .header-num { font-size:11px; font-weight:600; color:#c9a96e; letter-spacing:.07em; text-transform:uppercase; margin-bottom:6px; }
  .header-title { font-family:Georgia,serif; font-size:22px; font-weight:400; color:#1a1a1a; margin:0; }
  .body { padding:28px 32px; }
  .section-label { font-size:10px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#c9a96e; margin:0 0 10px; }
  .info-box { background:#fdf8f1; border:1px solid #ede7db; border-radius:8px; padding:14px 16px; margin-bottom:12px; }
  .info-label { font-size:10px; font-weight:600; letter-spacing:.07em; text-transform:uppercase; color:#c9a96e; margin-bottom:4px; }
  .info-value { font-size:15px; font-weight:500; color:#1a1a1a; }
  .info-value-mono { font-family:'Courier New',monospace; font-size:16px; font-weight:700; color:#1a1a1a; letter-spacing:.04em; }
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .divider { border:none; border-top:1px solid #f0ede6; margin:22px 0; }
  .item-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f5f1eb; font-size:14px; color:#1a1a1a; }
  .item-name { font-weight:500; }
  .item-qty { font-size:12px; color:#888; margin-top:2px; }
  .total-row { display:flex; justify-content:space-between; font-size:14px; color:#888; padding:5px 0; }
  .total-row-final { display:flex; justify-content:space-between; font-size:16px; font-weight:600; color:#1a1a1a; padding:10px 0 0; border-top:1px solid #f0ede6; margin-top:6px; }
  .notice { background:#fdf8f1; border:1px solid #ede7db; border-left:3px solid #c9a96e; border-radius:0 8px 8px 0; padding:12px 16px; font-size:13px; color:#666; line-height:1.6; margin-top:16px; }
  .footer { padding:20px 32px; font-size:12px; color:#aaa; text-align:center; line-height:1.6; }
  .btn { display:inline-block; background:#1a1a1a; color:#ffffff !important; text-decoration:none; border-radius:8px; padding:13px 24px; font-size:14px; font-weight:500; margin-top:20px; }
`;

// ── Helpers ───────────────────────────────────────────────────────
function formatCurrency(amount) {
  return `R ${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-ZA', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function itemRows(items) {
  return items.map(item => `
    <div class="item-row">
      <div>
        <div class="item-name">${item.name}</div>
        <div class="item-qty">Qty: ${item.quantity}</div>
      </div>
      <div>${formatCurrency(item.price * item.quantity)}</div>
    </div>
  `).join('');
}

// ── Order confirmation email ──────────────────────────────────────
function orderConfirmationEmail(order) {
  const isEFT = order.paymentMethod === 'eft';

  const paymentSection = isEFT ? `
    <p class="section-label" style="margin-top:22px">Complete your payment</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
      <tr>
        <td style="padding:0 5px 10px 0; width:50%">
          <div class="info-box">
            <div class="info-label">Bank</div>
            <div class="info-value">${process.env.BANK_NAME || 'First National Bank'}</div>
          </div>
        </td>
        <td style="padding:0 0 10px 5px; width:50%">
          <div class="info-box">
            <div class="info-label">Account type</div>
            <div class="info-value">${process.env.BANK_ACCOUNT_TYPE || 'Cheque / Current'}</div>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 5px 10px 0">
          <div class="info-box">
            <div class="info-label">Account number</div>
            <div class="info-value info-value-mono">${process.env.BANK_ACCOUNT_NUMBER || ''}</div>
          </div>
        </td>
        <td style="padding:0 0 10px 5px">
          <div class="info-box">
            <div class="info-label">Branch code</div>
            <div class="info-value info-value-mono">${process.env.BANK_BRANCH_CODE || ''}</div>
          </div>
        </td>
      </tr>
    </table>

    <div class="info-box" style="border-left:3px solid #c9a96e; border-radius:0 8px 8px 0; margin-top:4px">
      <div class="info-label">Your EFT reference — use exactly as shown</div>
      <div class="info-value-mono" style="font-size:20px; margin-top:4px">${order.eftReference}</div>
    </div>

    <div class="notice">
      Please make payment within <strong>48 hours</strong> to avoid cancellation.
      Use the reference above exactly as shown — this is how we match your payment to your order.
    </div>
  ` : `
    <div class="info-box" style="margin-top:16px">
      <div class="info-label">Payment on delivery</div>
      <div class="info-value">
        Please have <strong>${formatCurrency(order.total)}</strong> in cash ready for the courier.
        Our drivers cannot provide change.
      </div>
    </div>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>Order Confirmation — ${order.orderId}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">

          <div class="header">
            <div class="header-num">Order confirmed</div>
            <h1 class="header-title">Thank you, ${order.customer.firstName}!</h1>
          </div>

          <div class="body">
            <p style="font-size:14px; color:#555; margin:0 0 20px; line-height:1.6">
              Your order has been received and is being processed.
              We'll update you as it moves through to delivery.
            </p>

            <!-- Order ID -->
            <div class="info-box">
              <div class="info-label">Order ID</div>
              <div class="info-value-mono">${order.orderId}</div>
              <div style="font-size:12px; color:#888; margin-top:4px">
                Placed on ${formatDate(order.createdAt)}
              </div>
            </div>

            <hr class="divider"/>

            <!-- Items -->
            <p class="section-label">Items ordered</p>
            ${itemRows(order.items)}

            <!-- Totals -->
            <div style="margin-top:12px">
              <div class="total-row">
                <span>Subtotal</span>
                <span>${formatCurrency(order.subtotal)}</span>
              </div>
              <div class="total-row">
                <span>Delivery</span>
                <span>${formatCurrency(order.deliveryFee)}</span>
              </div>
              <div class="total-row-final">
                <span>Total</span>
                <span>${formatCurrency(order.total)}</span>
              </div>
            </div>

            <hr class="divider"/>

            <!-- Delivery address -->
            <p class="section-label">Delivery address</p>
            <div class="info-box">
              <div class="info-value" style="font-size:14px; line-height:1.7">
                ${order.customer.firstName} ${order.customer.lastName}<br/>
                ${order.customer.address}<br/>
                ${order.customer.city}, ${order.customer.province}, ${order.customer.postalCode}<br/>
                ${order.customer.phone}
                ${order.customer.note ? `<br/><span style="color:#888; font-style:italic">Note: ${order.customer.note}</span>` : ''}
              </div>
            </div>

            <hr class="divider"/>

            <!-- Payment -->
            <p class="section-label">Payment</p>
            ${paymentSection}

          </div>

          <div class="footer">
            Questions? Reply to this email or visit
            <a href="${STORE_URL}" style="color:#c9a96e">${STORE_NAME}</a><br/>
            © ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  return {
    subject: `Order confirmed — ${order.orderId} | ${STORE_NAME}`,
    html,
  };
}

module.exports = { orderConfirmationEmail };