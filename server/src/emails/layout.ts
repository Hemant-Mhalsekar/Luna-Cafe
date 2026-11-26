/** Shared bits for the café's emails: escaping, the branded HTML shell, and a details table. */

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

const C = { cream: '#F6EFDF', card: '#FFFDF8', forest: '#4A6B4F', dark: '#294632', cta: '#B4501F', line: '#E2D8C3' };

export function detailsTable(rows: [string, string][]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0 4px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid ${C.line};color:${C.forest};font-size:14px;width:38%">${escapeHtml(k)}</td><td style="padding:8px 0;border-bottom:1px solid ${C.line};color:${C.dark};font-size:15px;font-weight:600">${escapeHtml(v)}</td></tr>`,
    )
    .join('')}</table>`;
}

export function button(label: string, href: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${C.cta};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;font-size:15px">${escapeHtml(label)}</a>`;
}

/** Table-based layout with inline styles: what email clients (Gmail, Outlook) render reliably. */
export function layout({ preheader, heading, body, siteUrl }: { preheader: string; heading: string; body: string; siteUrl: string }): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:${C.cream};font-family:'DM Sans',Helvetica,Arial,sans-serif;color:${C.dark}">
<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream}"><tr><td align="center" style="padding:28px 14px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
<tr><td style="padding:0 6px 16px;font-size:22px;font-weight:700;color:${C.dark}">&#9790; Lunaa Café</td></tr>
<tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:28px">
<h1 style="margin:0 0 10px;font-size:26px;line-height:1.2;color:${C.dark}">${escapeHtml(heading)}</h1>
${body}
</td></tr>
<tr><td style="padding:16px 6px;font-size:12px;line-height:1.5;color:${C.forest}">
Lunaa Café is a fictional café and <a href="${escapeHtml(siteUrl)}" style="color:${C.forest}">${escapeHtml(siteUrl.replace(/^https?:\/\//, ''))}</a> is a portfolio demo, so nobody is actually expecting you. Thanks for trying it! You got this email because this address was entered on the site.
</td></tr>
</table></td></tr></table></body></html>`;
}

export const footerText = (siteUrl: string) =>
  `\n--\nLuna Café is a fictional café and ${siteUrl} is a portfolio demo, so nobody is actually expecting you. You got this email because this address was entered on the site.`;
