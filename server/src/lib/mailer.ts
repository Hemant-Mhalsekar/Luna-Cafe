import { getEnv } from '../config/env.js';

export interface Mail {
  to: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
  attachments?: { name: string; content: string }[]; // content: base64
}

export type MailTransport = (mail: Mail) => Promise<void>;

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

/** Sends through Brevo's HTTP API. Render's free plan blocks SMTP ports, so plain SMTP is not an option. */
const brevoTransport: MailTransport = async (mail) => {
  const env = getEnv();
  const res = await fetch(BREVO_URL, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY!, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: env.MAIL_FROM_ADDRESS, name: env.MAIL_FROM_NAME },
      to: [mail.to],
      replyTo: env.MAIL_REPLY_TO ? { email: env.MAIL_REPLY_TO } : undefined,
      subject: mail.subject,
      htmlContent: mail.html,
      textContent: mail.text,
      attachment: mail.attachments,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    // Brevo explains the problem in the body (bad key, unverified sender, daily limit...). Never log the key.
    throw new Error(`Brevo answered ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
};

/** Without Brevo settings (local dev, tests, CI) nothing is sent; the email is summarised in the log. */
const logTransport: MailTransport = async (mail) => {
  if (getEnv().NODE_ENV !== 'test') {
    console.info(`[mail] not sent (BREVO_API_KEY / MAIL_FROM_ADDRESS not set): "${mail.subject}" to ${mail.to.email}`);
  }
};

let override: MailTransport | null = null;

/** Tests swap the transport to capture emails. Pass null to go back to the default. */
export function setMailTransport(transport: MailTransport | null): void {
  override = transport;
}

function currentTransport(): MailTransport {
  if (override) return override;
  const env = getEnv();
  return env.BREVO_API_KEY && env.MAIL_FROM_ADDRESS ? brevoTransport : logTransport;
}

/**
 * Sends in the background: the request that triggered it never waits for the email,
 * and a failed email never fails a booking. Failures are logged.
 */
export function sendInBackground(mail: Mail): void {
  void currentTransport()(mail).catch((err: unknown) => {
    console.error(`[mail] failed to send "${mail.subject}" to ${mail.to.email}:`, err instanceof Error ? err.message : err);
  });
}
