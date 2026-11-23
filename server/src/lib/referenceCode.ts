import { randomInt } from 'node:crypto';

// No 0/O or 1/I/L, so codes are easy to read out over the phone.
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export function newReferenceCode(): string {
  let code = '';
  for (let i = 0; i < 5; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `LUNA-${code}`;
}

export const REFERENCE_CODE_RE = /^LUNA-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{5}$/;
