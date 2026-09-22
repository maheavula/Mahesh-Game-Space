import crypto from 'crypto';

/**
 * Generates high-entropy unpredictable identifiers (UUIDv4 or random 12+ char alphanumeric tokens)
 */
export function generateUUID(prefix?: string): string {
  const uuid = crypto.randomUUID();
  return prefix ? `${prefix}_${uuid}` : uuid;
}

export function generateHighEntropyToken(length: number = 12): string {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}
