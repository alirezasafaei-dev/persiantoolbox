#!/usr/bin/env node

/**
 * Generate VAPID keys for Web Push Notifications
 * 
 * Usage: node scripts/generate-vapid-keys.js
 * 
 * This script generates a VAPID key pair for web push notifications.
 * The keys should be stored as environment variables:
 * - VAPID_PUBLIC_KEY
 * - VAPID_PRIVATE_KEY
 * - VAPID_EMAIL (contact email for the push service)
 */

const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n=== VAPID Keys Generated ===\n');
console.log('Add these to your .env.local file:\n');
console.log(`VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log(`VAPID_EMAIL="mailto:admin@persiantoolbox.ir"`);
console.log('\n=== End of VAPID Keys ===\n');
