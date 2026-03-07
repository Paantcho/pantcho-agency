import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-gcm";
const KEY_LEN = 32;
const IV_LEN = 16;
const SALT_LEN = 32;
const TAG_LEN = 16;

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret || secret.length < 16) {
    throw new Error(
      "ENCRYPTION_KEY must be set in .env.local (min 16 chars) for API key encryption"
    );
  }
  return scryptSync(secret, "hubia-ai-provider", KEY_LEN);
}

/**
 * Encrypts a string (e.g. API key). Returns base64(iv + tag + ciphertext).
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

/**
 * Decrypts a string encrypted with encrypt(). Use only server-side; never send result to client.
 */
export function decrypt(ciphertextBase64: string): string {
  const key = getKey();
  const buf = Buffer.from(ciphertextBase64, "base64");
  if (buf.length < IV_LEN + TAG_LEN) {
    throw new Error("Invalid encrypted payload");
  }
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const enc = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc) + decipher.final("utf8");
}
