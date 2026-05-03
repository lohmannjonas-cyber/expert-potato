import { Resend } from "resend";

type EmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(input: EmailInput) {
  const from = process.env.EMAIL_FROM ?? "KiteSpot Radar <alerts@example.com>";
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is required for production email alerts.");
    }
    console.info(`[email skipped] ${input.to}: ${input.subject}`);
    return { id: "local-dev-email", skipped: true };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text
  });

  if (error) throw new Error(error.message);
  return data;
}
