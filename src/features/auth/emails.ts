// HTML email templates for transactional emails sent via Resend.

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

export function verificationEmailHtml(code: string, name: string): string {
  const body = `
    <p>Hello ${escapeHtml(name)},</p>
    <p>Your email verification code is:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:8px;color:#0f172a;margin:24px 0;">${code}</p>
    <p>This code expires in 10 minutes. Use it to verify your email address and complete your registration.</p>
    <p>If you did not create an account with Mystic Egypt, you can safely ignore this email.</p>
  `;
  return baseLayout("Verify your email", body);
}

export function passwordResetEmailHtml(code: string, name: string): string {
  const body = `
    <p>Hello ${escapeHtml(name)},</p>
    <p>We received a request to reset your password. Your reset code is:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:8px;color:#0f172a;margin:24px 0;">${code}</p>
    <p>This code expires in 10 minutes. Enter it on the password reset page to choose a new password.</p>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
  `;
  return baseLayout("Reset your password", body);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
