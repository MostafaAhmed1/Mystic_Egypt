import { NextResponse } from "next/server";
import { sendEmail, APP_EMAIL_FROM } from "@/core/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { error: "Please enter a message (at least 10 characters)." },
        { status: 400 },
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long (max 5000 characters)." },
        { status: 400 },
      );
    }

    const subjectLabels: Record<string, string> = {
      general: "General Enquiry",
      booking: "Booking Question",
      custom: "Custom Tour Request",
      support: "Support",
    };

    const subjectLabel = subjectLabels[subject] ?? subject;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333; width: 120px;">Name:</td>
            <td style="padding: 8px 0; color: #555;">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td>
            <td style="padding: 8px 0; color: #555;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333;">Subject:</td>
            <td style="padding: 8px 0; color: #555;">${escapeHtml(subjectLabel)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #333; vertical-align: top;">Message:</td>
            <td style="padding: 8px 0; color: #555; white-space: pre-wrap;">${escapeHtml(message)}</td>
          </tr>
        </table>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999;">
          This message was sent via the Mystic Egypt contact form at mysticegypt.net
        </p>
      </div>
    `;

    const result = await sendEmail({
      to: "info@mysticegypt.net",
      subject: `[Mystic Egypt] ${subjectLabel}: ${escapeHtml(name)}`,
      html,
    });

    if (!result.sent) {
      console.error("[contact] Email send failed:", result.error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again or email us directly at info@mysticegypt.net." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Your message has been sent. We'll get back to you within 24 hours.",
    });
  } catch (error) {
    console.error("[contact] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
