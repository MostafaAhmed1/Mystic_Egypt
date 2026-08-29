// HTML email templates for booking-related transactional emails (Resend).

function baseLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
            <tr>
              <td style="padding:24px 32px;background-color:#0f172a;color:#ffffff;font-size:18px;font-weight:600;">
                Mystic Egypt
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#18181b;font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;border-top:1px solid #e4e4e7;color:#71717a;font-size:12px;">
                You received this email because of activity on your Mystic Egypt account.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export interface BookingConfirmationEmailData {
  name: string;
  tourTitle: string;
  tourDate: string;
  numPeople: number;
  totalAmount: string;
  statusLabel: string;
}

export function bookingConfirmationEmailHtml(data: BookingConfirmationEmailData): string {
  const body = `
    <p>Hello ${escapeHtml(data.name)},</p>
    <p>We received your booking request for <strong>${escapeHtml(data.tourTitle)}</strong>.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid #e4e4e7;border-radius:8px;">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;"><strong>Tour date:</strong></td><td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;">${escapeHtml(data.tourDate)}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;"><strong>Travellers:</strong></td><td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;">${data.numPeople}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;"><strong>Total:</strong></td><td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;">${escapeHtml(data.totalAmount)}</td></tr>
      <tr><td style="padding:12px 16px;"><strong>Status:</strong></td><td style="padding:12px 16px;">${escapeHtml(data.statusLabel)}</td></tr>
    </table>
    <p>You can view the status of your booking from your dashboard at any time.</p>
    <p>Thank you for choosing Mystic Egypt.</p>
  `;
  return baseLayout("Booking received", body);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
