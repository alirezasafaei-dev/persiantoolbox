export type BusinessDocumentType = 'invoice' | 'proforma' | 'receipt';

export interface BusinessParty {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  nationalId?: string;
  registrationNo?: string;
  economicCode?: string;
}

export interface BusinessLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
}

export interface BusinessDocumentDraft {
  id: string;
  documentType: BusinessDocumentType;
  createdAt: string;
  updatedAt: string;
  seller: BusinessParty;
  buyer: BusinessParty;
  items: BusinessLineItem[];
  notes?: string;
  documentNumber?: string;
  documentDate?: string;
  discountPercent?: number;
  taxPercent?: number;
  footer?: string;
  logoDataUrl?: string;
  templateId: string;
}

export interface BusinessDocumentTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
}

export interface BusinessDocumentTemplate {
  id: BusinessDocumentType;
  title: string;
  description: string;
}

export interface BusinessFeatureGate {
  canExportPdf: boolean;
  canExportDocx: boolean;
  canUseLogo: boolean;
  canSaveDraft: boolean;
  maxDrafts: number;
  hasWatermark: boolean;
}

export interface BusinessProfile {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  nationalId?: string;
  registrationNo?: string;
  economicCode?: string;
  logoDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const DISCLAIMER =
  'این ابزار صرفاً برای ساخت پیش‌نویس و خروجی قابل ویرایش اسناد کسب‌وکار بر اساس اطلاعات واردشده توسط کاربر است و جایگزین نرم‌افزار حسابداری، مشاوره مالیاتی، مشاوره حقوقی یا سند رسمی نیست. مسئولیت صحت اطلاعات، بررسی نهایی، چاپ، ارسال و استفاده از خروجی بر عهده کاربر است.';

export const PRIVACY_TEXT =
  'اطلاعات سند تا حد امکان در مرورگر شما پردازش می‌شود و برای ساخت خروجی نیازی به ارسال اطلاعات به سرور نیست.';

export const WATERMARK_TEXT = 'ساخته‌شده با PersianToolbox';

export function validateParty(party: BusinessParty, role: string): string[] {
  const errors: string[] = [];
  if (!party.name?.trim()) {
    errors.push(`نام ${role} الزامی است`);
  }
  if (party.nationalId && !/^\d{10}$/.test(party.nationalId)) {
    errors.push(`کد ملی ${role} باید ۱۰ رقمی باشد`);
  }
  if (party.phone && !/^0\d{10}$/.test(party.phone)) {
    errors.push(`شماره تلفن ${role} نامعتبر است`);
  }
  if (party.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(party.email)) {
    errors.push(`ایمیل ${role} نامعتبر است`);
  }
  return errors;
}

export function validateItems(items: BusinessLineItem[]): string[] {
  const errors: string[] = [];
  if (items.length === 0) {
    errors.push('حداقل یک ردیف کالا/خدمت الزامی است');
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item?.description?.trim()) {
      errors.push(`شرح ردیف ${i + 1} الزامی است`);
    }
    if ((item?.quantity ?? 0) <= 0) {
      errors.push(`تعداد ردیف ${i + 1} باید بیشتر از صفر باشد`);
    }
    if ((item?.unitPrice ?? 0) <= 0) {
      errors.push(`قیمت واحد ردیف ${i + 1} باید بیشتر از صفر باشد`);
    }
  }
  return errors;
}
