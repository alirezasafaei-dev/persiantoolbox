/**
 * Payment Integration - PersianToolbox
 *
 * Handles payment processing and integration with database persistence.
 * Prices are stored in Toman and converted exactly once at the gateway boundary.
 */

import { randomUUID } from 'node:crypto';
import { query } from '@/lib/server/db';
import { agentLogger } from