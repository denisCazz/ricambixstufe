#!/usr/bin/env node
/**
 * One-time Satispay Business activation: generate an RSA key pair and
 * exchange an activation code for a KeyId.
 *
 * Usage:
 *   node scripts/satispay-activate.mjs <ACTIVATION_CODE> [--live]
 *
 * Copy the printed SATISPAY_KEY_ID and SATISPAY_PRIVATE_KEY into .env.local
 * (or Coolify). Do not commit the private key.
 */

import { generateKeyPairSync } from "node:crypto";

const token = process.argv[2];
const live = process.argv.includes("--live");

if (!token || token.startsWith("-")) {
  console.error(
    "Usage: node scripts/satispay-activate.mjs <ACTIVATION_CODE> [--live]"
  );
  process.exit(1);
}

const host = live
  ? "authservices.satispay.com"
  : "staging.authservices.satispay.com";
const mode = live ? "live" : "sandbox";

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 4096,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const res = await fetch(`https://${host}/g_business/v1/authentication_keys`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-satispay-devicetype": "ECOMMERCE_PLUGIN",
    "x-satispay-appn": "RicambiXStufe",
    "x-satispay-apph": "Bitora",
  },
  body: JSON.stringify({
    public_key: publicKey,
    token: token.trim(),
  }),
});

const text = await res.text();
let data;
try {
  data = JSON.parse(text);
} catch {
  console.error(`Satispay responded HTTP ${res.status}:`, text.slice(0, 500));
  process.exit(1);
}

if (!res.ok || !data.key_id) {
  console.error(`Activation failed (HTTP ${res.status}, mode ${mode}):`);
  console.error(data);
  process.exit(1);
}

const pemOneLine = privateKey.replace(/\n/g, "\\n").trim();

console.log(`# Satispay activation OK (mode: ${mode})`);
console.log(`# Paste these into .env.local / Coolify, then restart the app.`);
console.log("");
console.log(`SATISPAY_MODE=${mode}`);
console.log(`SATISPAY_KEY_ID=${data.key_id}`);
console.log(`SATISPAY_PRIVATE_KEY="${pemOneLine}"`);
