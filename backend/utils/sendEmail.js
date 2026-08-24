const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter from environment variables.
 * Supports Gmail, Outlook, or any SMTP provider.
 * Falls back to Ethereal (fake SMTP) in development if no credentials set.
 */
const createTransporter = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    // If Gmail account, use service: 'gmail'
    if (process.env.SMTP_USER.includes('gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS.replace(/\s+/g, ''),
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback: Ethereal fake SMTP for development (no real email sent)
  const testAccount = await nodemailer.createTestAccount();
  console.log('[Email] No SMTP credentials found. Using Ethereal test account.');
  console.log('[Email] Preview URL will be logged after sending.');
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// ── Branded HTML Email Template ───────────────────────────────────────────────
const emailTemplate = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F5F3F0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3F0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1C1917;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#FFFFFF;font-size:28px;font-weight:800;letter-spacing:4px;">CURA.</h1>
              <p style="margin:6px 0 0;color:#A8A29E;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Quiet Elegance</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F5F3F0;padding:24px 40px;text-align:center;border-top:1px solid #E8E6E1;">
              <p style="margin:0;color:#A8A29E;font-size:12px;">© 2026 CURA. All rights reserved.</p>
              <p style="margin:6px 0 0;color:#A8A29E;font-size:11px;">If you did not request this email, please ignore it safely.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Send Password Reset Email ─────────────────────────────────────────────────
const sendPasswordResetEmail = async (toEmail, userName, resetUrl) => {
  const transporter = await createTransporter();

  const body = `
    <h2 style="margin:0 0 8px;color:#1C1917;font-size:22px;font-weight:700;">Reset Your Password</h2>
    <p style="color:#57534E;font-size:15px;line-height:1.6;margin:0 0 24px;">Hi ${userName}, we received a request to reset your password. Click the button below to create a new one. This link expires in <strong>15 minutes</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:8px 0 32px;">
          <a href="${resetUrl}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:14px;letter-spacing:1px;">Reset My Password</a>
        </td>
      </tr>
    </table>
    <p style="color:#A8A29E;font-size:12px;margin:0;">Or copy this link into your browser:<br/><span style="color:#1C1917;word-break:break-all;">${resetUrl}</span></p>
  `;

  const info = await transporter.sendMail({
    from: `"CURA." <${process.env.SMTP_USER || 'noreply@cura.com'}>`,
    to: toEmail,
    subject: 'Reset Your CURA Password',
    html: emailTemplate('Reset Password', body),
  });

  // Log Ethereal preview URL in development
  if (!process.env.SMTP_USER) {
    console.log('[Email] Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
};

// ── Send Magic Link Email ─────────────────────────────────────────────────────
const sendMagicLinkEmail = async (toEmail, magicUrl) => {
  const transporter = await createTransporter();

  const body = `
    <h2 style="margin:0 0 8px;color:#1C1917;font-size:22px;font-weight:700;">Your Magic Login Link ✨</h2>
    <p style="color:#57534E;font-size:15px;line-height:1.6;margin:0 0 24px;">Click the button below to sign in instantly — no password needed. This link expires in <strong>15 minutes</strong> and can only be used once.</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:8px 0 32px;">
          <a href="${magicUrl}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:14px;letter-spacing:1px;">✨ Sign In to CURA</a>
        </td>
      </tr>
    </table>
    <p style="color:#A8A29E;font-size:12px;margin:0;">Or copy this link into your browser:<br/><span style="color:#1C1917;word-break:break-all;">${magicUrl}</span></p>
  `;

  const info = await transporter.sendMail({
    from: `"CURA." <${process.env.SMTP_USER || 'noreply@cura.com'}>`,
    to: toEmail,
    subject: '✨ Your CURA Magic Login Link',
    html: emailTemplate('Magic Login Link', body),
  });

  if (!process.env.SMTP_USER) {
    console.log('[Email] Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (toEmail, order, userName = 'Valued Customer') => {
  try {
    const transporter = await createTransporter();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const orderIdStr = order._id.toString();
    const shortId = orderIdStr.slice(-8).toUpperCase();
    const trackingLink = `${frontendUrl}/track-order?id=${orderIdStr}`;
    const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const itemsHtml = (order.orderItems || []).map(item => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #E8E6E1;">
          <strong style="color:#1C1917;font-size:14px;">${item.name}</strong>
          ${item.selectedSize || item.selectedColor ? `<br/><span style="color:#78716C;font-size:12px;">${item.selectedSize ? `Size: ${item.selectedSize}` : ''} ${item.selectedColor ? `| Color: ${item.selectedColor}` : ''}</span>` : ''}
        </td>
        <td style="padding:12px;border-bottom:1px solid #E8E6E1;text-align:center;color:#57534E;font-size:14px;">
          x${item.qty}
        </td>
        <td style="padding:12px;border-bottom:1px solid #E8E6E1;text-align:right;color:#1C1917;font-weight:700;font-size:14px;">
          ₹${(item.price * item.qty).toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('');

    const body = `
      <div style="text-align:center;margin-bottom:24px;">
        <span style="background:#C5A059;color:#000000;padding:4px 12px;border-radius:50px;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">Order Confirmed</span>
        <h2 style="margin:12px 0 4px;color:#1C1917;font-size:24px;font-weight:700;">Thank You For Your Purchase!</h2>
        <p style="color:#78716C;font-size:13px;margin:0;">Order #${shortId} • ${orderDate}</p>
      </div>

      <p style="color:#57534E;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Hi <strong>${userName}</strong>, we've received your order and our atelier has begun crafting your pieces with utmost care. You can track your shipment status live below.
      </p>

      <!-- Order Items Table -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;background:#FAF9F6;border-radius:8px;overflow:hidden;">
        <thead>
          <tr style="background:#E8E6E1;color:#1C1917;font-size:12px;letter-spacing:1px;text-transform:uppercase;">
            <th style="padding:10px 12px;text-align:left;">Item</th>
            <th style="padding:10px 12px;text-align:center;">Qty</th>
            <th style="padding:10px 12px;text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Order Summary Totals -->
      <div style="background:#FAF9F6;padding:16px;border-radius:8px;margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="color:#57534E;font-size:14px;">
          <tr>
            <td style="padding:4px 0;">Payment Method</td>
            <td style="padding:4px 0;text-align:right;color:#1C1917;font-weight:600;">${order.paymentMethod || 'Online Payment'}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;border-bottom:1px solid #E8E6E1;">Status</td>
            <td style="padding:4px 0;text-align:right;color:#22C55E;font-weight:700;border-bottom:1px solid #E8E6E1;">${order.isPaid ? 'Paid ✅' : 'Confirmed'}</td>
          </tr>
          <tr>
            <td style="padding:12px 0 0;font-size:16px;font-weight:800;color:#1C1917;">Total Paid</td>
            <td style="padding:12px 0 0;text-align:right;font-size:18px;font-weight:800;color:#1C1917;">₹${(order.totalPrice || 0).toLocaleString('en-IN')}</td>
          </tr>
        </table>
      </div>

      <!-- Shipping Address -->
      ${order.shippingAddress ? `
        <div style="border:1px solid #E8E6E1;padding:16px;border-radius:8px;margin-bottom:28px;">
          <h4 style="margin:0 0 6px;color:#1C1917;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Shipping Destination</h4>
          <p style="margin:0;color:#57534E;font-size:13px;line-height:1.5;">
            ${order.shippingAddress.address}<br/>
            ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br/>
            ${order.shippingAddress.country}<br/>
            📞 ${order.shippingAddress.phone || ''}
          </p>
        </div>
      ` : ''}

      <!-- Track Button -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:8px 0 16px;">
            <a href="${trackingLink}" style="display:inline-block;background:#1C1917;color:#FFFFFF;text-decoration:none;padding:14px 36px;border-radius:50px;font-weight:700;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;">
              📦 Track Order Shipment
            </a>
          </td>
        </tr>
      </table>
    `;

    const info = await transporter.sendMail({
      from: `"CURA Atelier" <${process.env.SMTP_USER || 'orders@cura.com'}>`,
      to: toEmail,
      subject: `✨ CURA Order Confirmed #${shortId}`,
      html: emailTemplate('Order Confirmation', body),
    });

    if (!process.env.SMTP_USER) {
      console.log('[Order Email] Ethereal Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('[Order Email Error]', error.message);
    return null;
  }
};

module.exports = { sendPasswordResetEmail, sendMagicLinkEmail, sendOrderConfirmationEmail };
