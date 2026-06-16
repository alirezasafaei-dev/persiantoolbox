/**
 * Payment Integration - PersianToolbox
 *
 * Handles payment processing and integration
 */

import {agentLogger} from '@/lib/agent-logger';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'zarinpal' | 'idpay' | 'nextpay' | 'wallet';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentGateway {
  name: string;
  namePersian: string;
  supported: boolean;
  fees: number;
}

const paymentGateways: PaymentGateway[] = [
  {name: 'zarinpal', namePersian: 'زرین‌پال', supported: true, fees: 0.02},
  {name: 'idpay', namePersian: 'آیدی‌پی', supported: true, fees: 0.015},
  {name: 'nextpay', namePersian: 'نکست‌پی', supported: true, fees: 0.018},
  {name: 'wallet', namePersian: 'کیف پول', supported: true, fees: 0},
];

const payments = new Map<string, Payment>();

export function getPaymentGateways(): PaymentGateway[] {
  return paymentGateways.filter((g) => g.supported);
}

export function getPaymentGateway(method: PaymentMethod): PaymentGateway | undefined {
  return paymentGateways.find((g) => g.name === method);
}

export function createPayment(
  userId: string,
  amount: number,
  method: PaymentMethod,
  description: string,
  metadata?: Record<string, unknown>,
): Payment {
  const payment: Payment = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    amount,
    currency: 'IRR',
    method,
    status: 'pending',
    description,
    metadata,
    createdAt: new Date().toISOString(),
  };

  payments.set(payment.id, payment);
  agentLogger.info('payments', 'create', `Payment created: ${payment.id}`, {
    userId,
    amount,
    method,
  });

  return payment;
}

export function completePayment(paymentId: string): boolean {
  const payment = payments.get(paymentId);
  if (!payment || payment.status !== 'pending') {
    return false;
  }

  payment.status = 'completed';
  payment.completedAt = new Date().toISOString();
  payments.set(paymentId, payment);

  agentLogger.info('payments', 'complete', `Payment completed: ${paymentId}`);
  return true;
}

export function failPayment(paymentId: string): boolean {
  const payment = payments.get(paymentId);
  if (!payment || payment.status !== 'pending') {
    return false;
  }

  payment.status = 'failed';
  payments.set(paymentId, payment);

  agentLogger.info('payments', 'fail', `Payment failed: ${paymentId}`);
  return true;
}

export function refundPayment(paymentId: string): boolean {
  const payment = payments.get(paymentId);
  if (!payment || payment.status !== 'completed') {
    return false;
  }

  payment.status = 'refunded';
  payments.set(paymentId, payment);

  agentLogger.info('payments', 'refund', `Payment refunded: ${paymentId}`);
  return true;
}

export function getUserPayments(userId: string): Payment[] {
  return Array.from(payments.values()).filter((p) => p.userId === userId);
}

export function getPaymentById(paymentId: string): Payment | undefined {
  return payments.get(paymentId);
}

export function calculateFees(amount: number, method: PaymentMethod): number {
  const gateway = getPaymentGateway(method);
  if (!gateway) {
    return 0;
  }
  return Math.round(amount * gateway.fees);
}

export function generatePaymentLink(
  paymentId: string,
  callbackUrl: string,
): string {
  const payment = payments.get(paymentId);
  if (!payment) {
    throw new Error(`Payment not found: ${paymentId}`);
  }

  return `https://payment.persiantoolbox.ir/verify?id=${paymentId}&callback=${encodeURIComponent(callbackUrl)}`;
}
