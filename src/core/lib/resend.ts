import { Resend } from "resend";

// Lazy-init so the module can be imported even when RESEND_API_KEY is not yet set.
function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_placeholder") {
    return null;
  }
  return new Resend(apiKey);
}

export const APP_EMAIL_FROM = process.env.APP_EMAIL_FROM ?? "Mystic Egypt <noreply@mysticegypt.net>";

/**
 * Send a transactional email through Resend.
 * Returns true when accepted by Resend, false when the API key is not configured
 * or the request failed. Callers must handle the false case gracefully.
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return {
      sent: false,
      error: "Resend is not configured. Set RESEND_API_KEY.",
    };
  }

  const { error } = await resend.emails.send({
    from: APP_EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    return { sent: false, error: error.message };
  }

  return { sent: true };
}
