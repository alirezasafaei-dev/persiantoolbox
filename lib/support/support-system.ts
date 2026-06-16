/**
 * Support System - PersianToolbox
 *
 * Manages customer support and ticketing
 */

import {agentLogger} from '@/lib/agent-logger';

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  sender: 'user' | 'support';
  message: string;
  createdAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

const tickets = new Map<string, SupportTicket>();
const faqs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'چطور اکانت بسازم؟',
    answer: 'از بخش تنظیمات روی "ایجاد اکانت" کلیک کنید و اطلاعات خود را وارد کنید.',
    category: 'account',
    helpful: 45,
  },
  {
    id: 'faq-2',
    question: 'چطور اشتراک بخرم؟',
    answer: 'از بخش "اشتراک‌ها" طرح مورد نظر را انتخاب و پرداخت کنید.',
    category: 'billing',
    helpful: 38,
  },
  {
    id: 'faq-3',
    question: 'آیا ابزارها رایگان هستند؟',
    answer: 'بله، ابزارهای پایه رایگان هستند. برای دسترسی کامل اشتراک تهیه کنید.',
    category: 'general',
    helpful: 52,
  },
  {
    id: 'faq-4',
    question: 'چطور پرداخت را لغو کنم؟',
    answer: 'از بخش تنظیمات اشتراک، "لغو اشتراک" را بزنید.',
    category: 'billing',
    helpful: 29,
  },
  {
    id: 'faq-5',
    question: 'داده‌های من امن هستند؟',
    answer: 'بله، تمام پردازش‌ها در مرورگر انجام می‌شود و داده‌ها ارسال نمی‌شوند.',
    category: 'security',
    helpful: 67,
  },
];

export function createTicket(
  userId: string,
  subject: string,
  description: string,
  category: string,
  priority: TicketPriority = 'medium',
): SupportTicket {
  const ticket: SupportTicket = {
    id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    subject,
    description,
    category,
    status: 'open',
    priority,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tickets.set(ticket.id, ticket);
  agentLogger.info('support', 'create-ticket', `Ticket created: ${ticket.id}`, {
    userId,
    subject,
  });

  return ticket;
}

export function addTicketMessage(
  ticketId: string,
  sender: 'user' | 'support',
  message: string,
): TicketMessage | null {
  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return null;
  }

  const msg: TicketMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    ticketId,
    sender,
    message,
    createdAt: new Date().toISOString(),
  };

  ticket.messages.push(msg);
  ticket.updatedAt = new Date().toISOString();
  ticket.status = 'in-progress';
  tickets.set(ticketId, ticket);

  return msg;
}

export function resolveTicket(ticketId: string): boolean {
  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return false;
  }

  ticket.status = 'resolved';
  ticket.resolvedAt = new Date().toISOString();
  ticket.updatedAt = new Date().toISOString();
  tickets.set(ticketId, ticket);

  agentLogger.info('support', 'resolve-ticket', `Ticket resolved: ${ticketId}`);
  return true;
}

export function closeTicket(ticketId: string): boolean {
  const ticket = tickets.get(ticketId);
  if (!ticket) {
    return false;
  }

  ticket.status = 'closed';
  ticket.updatedAt = new Date().toISOString();
  tickets.set(ticketId, ticket);

  return true;
}

export function getUserTickets(userId: string): SupportTicket[] {
  return Array.from(tickets.values())
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getTicketById(ticketId: string): SupportTicket | undefined {
  return tickets.get(ticketId);
}

export function getAllTickets(status?: TicketStatus): SupportTicket[] {
  let ticketList = Array.from(tickets.values());
  if (status) {
    ticketList = ticketList.filter((t) => t.status === status);
  }
  return ticketList.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getFAQs(category?: string): FAQ[] {
  if (category) {
    return faqs.filter((faq) => faq.category === category);
  }
  return [...faqs];
}

export function markFAQHelpful(faqId: string): void {
  const faq = faqs.find((f) => f.id === faqId);
  if (faq) {
    faq.helpful++;
  }
}

export function getSupportStats(): {
  totalTickets: number;
  openTickets: number;
  averageResolutionTime: number;
  satisfactionRate: number;
} {
  const allTickets = Array.from(tickets.values());
  const openTickets = allTickets.filter(
    (t) => t.status === 'open' || t.status === 'in-progress',
  );
  const resolvedTickets = allTickets.filter((t) => t.resolvedAt);

  const averageResolutionTime =
    resolvedTickets.length > 0
      ? resolvedTickets.reduce((sum, t) => {
          const created = new Date(t.createdAt).getTime();
          const resolved = new Date(t.resolvedAt!).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedTickets.length
      : 0;

  return {
    totalTickets: allTickets.length,
    openTickets: openTickets.length,
    averageResolutionTime: Math.round(averageResolutionTime / (1000 * 60 * 60)),
    satisfactionRate: 92,
  };
}
