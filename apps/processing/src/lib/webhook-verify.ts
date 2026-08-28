// ============================================================
// Nutri Atende — Webhook Signature Verification
// Verifies incoming webhook signatures for security
// ============================================================

import crypto from 'crypto';

export interface WebhookConfig {
  secret: string;
  headerName: string;
  algorithm?: 'sha256' | 'sha1';
}

/**
 * Verify HMAC signature for webhooks
 */
export function verifyHmacSignature(
  payload: string | Buffer,
  signature: string,
  config: WebhookConfig
): boolean {
  const expectedSignature = crypto
    .createHmac(config.algorithm || 'sha256', config.secret)
    .update(payload)
    .digest('hex');

  // Support different signature formats
  const providedSignature = signature.replace(/^sha256=/, '').replace(/^sha1=/, '');
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(providedSignature, 'hex')
  );
}

/**
 * Verify Withings webhook signature
 * Withings sends signature in 'X-Withings-Signature' header
 */
export function verifyWithingsSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  return verifyHmacSignature(payload, signature, {
    secret,
    headerName: 'x-withings-signature',
    algorithm: 'sha256',
  });
}

/**
 * Verify Dexcom webhook signature
 * Dexcom uses SHA256 HMAC in 'Authorization' header
 */
export function verifyDexcomSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  // Dexcom format: "Bearer <signature>"
  const cleanSignature = signature.replace(/^Bearer\s+/i, '');
  return verifyHmacSignature(payload, cleanSignature, {
    secret,
    headerName: 'authorization',
    algorithm: 'sha256',
  });
}

/**
 * Verify FreeStyle Libre webhook signature
 */
export function verifyFreeStyleSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  return verifyHmacSignature(payload, signature, {
    secret,
    headerName: 'x-libre-signature',
    algorithm: 'sha256',
  });
}

/**
 * Verify Apple Health webhook signature (custom relay)
 */
export function verifyAppleHealthSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): boolean {
  return verifyHmacSignature(payload, signature, {
    secret,
    headerName: 'x-apple-signature',
    algorithm: 'sha256',
  });
}

/**
 * Generic signature verification middleware for Fastify
 */
export function createWebhookVerifier(config: WebhookConfig) {
  return async function verifyWebhook(request: any, reply: any) {
    const signature = request.headers[config.headerName.toLowerCase()];
    
    if (!signature) {
      reply.code(401).send({ error: 'Missing signature header' });
      return false;
    }

    // Get raw body for verification
    const rawBody = request.rawBody || JSON.stringify(request.body);
    
    if (!verifyHmacSignature(rawBody, Array.isArray(signature) ? signature[0] : signature, config)) {
      reply.code(401).send({ error: 'Invalid signature' });
      return false;
    }

    return true;
  };
}

/**
 * Timing-safe string comparison
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  if (bufA.length !== bufB.length) {
    // Still do a comparison to avoid timing leak
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
}