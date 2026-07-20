/**
 * AES-256-GCM helpers for the sensitive-data vault.
 *
 * Key:  VAULT_ENCRYPTION_KEY env var -- must be exactly 64 hex chars (32 bytes).
 *       Generate once with:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Blob format (base64):  IV (16 bytes) || Auth-tag (16 bytes) || Ciphertext
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

const ALG = "aes-256-gcm"
const IV_BYTES = 16
const TAG_BYTES = 16
const KEY_BYTES = 32

function resolveKey(): Buffer {
  const hex = process.env.VAULT_ENCRYPTION_KEY
  if (!hex || hex.length !== KEY_BYTES * 2) {
    throw new Error(
      "VAULT_ENCRYPTION_KEY must be set to exactly 64 hex characters (32 bytes). " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    )
  }
  return Buffer.from(hex, "hex")
}

export function encryptSensitive(data: Record<string, string | null>): string {
  const key = resolveKey()
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALG, key, iv)
  const json = JSON.stringify(data)
  const ciphertext = Buffer.concat([cipher.update(json, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  // Concatenate: iv | tag | ciphertext -> base64
  return Buffer.concat([iv, tag, ciphertext]).toString("base64")
}

export function decryptSensitive(blob: string): Record<string, string | null> {
  const key = resolveKey()
  const buf = Buffer.from(blob, "base64")
  if (buf.length < IV_BYTES + TAG_BYTES) {
    throw new Error("Vault blob is too short -- corrupt or wrong format")
  }
  const iv = buf.subarray(0, IV_BYTES)
  const tag = buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES)
  const ciphertext = buf.subarray(IV_BYTES + TAG_BYTES)
  const decipher = createDecipheriv(ALG, key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return JSON.parse(decrypted.toString("utf8"))
}
