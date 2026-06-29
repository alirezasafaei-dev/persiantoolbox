export type LetterTemplateId = 'formal' | 'modern';

export type LetterType =
  | 'request'
  | 'complaint'
  | 'inquiry'
  | 'introduction'
  | 'notification'
  | 'cover-letter';

export interface FormalLetterData {
  senderName: string;
  senderPosition?: string;
  senderOrganization?: string;
  senderPhone?: string;
  senderAddress?: string;
  recipientName: string;
  recipientPosition?: string;
  recipientOrganization?: string;
  recipientAddress?: string;
  letterType: LetterType;
  subject: string;
  salutation: string;
  body: string;
  closing: string;
  referenceNumber?: string;
  letterDate: string;
  enclosures?: string;
  ccList?: string;
  templateId: LetterTemplateId;
  additionalParagraphs: string[];
  signatureDataUrl?: string;
}

export interface FormalLetterTemplate {
  id: LetterTemplateId;
  title: string;
  description: string;
}

export interface FormalLetterFeatureGate {
  canExportPdf: boolean;
  canExportDocx: boolean;
  canSaveDraft: boolean;
  maxDrafts: number;
  hasWatermark: boolean;
  availableTemplates: LetterTemplateId[];
  canAddCustomParagraphs: boolean;
  canUseSignature: boolean;
  maxBodyLength: number;
}

export const DISCLAIMER =
  'این ابزار صرفاً برای ساخت پیش‌نویس نامه اداری بر اساس اطلاعات واردشده توسط کاربر است و جایگزین نامه رسمی سازمانی، سربرگ‌های مجاز، یا نامه با ارزش قانونی نیست. مسئولیت صحت اطلاعات و استفاده از خروجی بر عهده کاربر است.';

export const PRIVACY_TEXT =
  'متن نامه در مرورگر شما پردازش می‌شود و برای ساخت خروجی نیازی به ارسال اطلاعات به سرور نیست.';

export const WATERMARK_TEXT = 'پیش‌نویس — ساخته‌شده با PersianToolbox';

export const LETTER_TYPE_LABELS: Record<LetterType, string> = {
  request: 'درخواست',
  complaint: 'شکایت',
  inquiry: 'استعلام',
  introduction: 'معرفی',
  notification: 'ابلاغیه',
  'cover-letter': 'نامه همراه',
};

export function validateLetter(data: FormalLetterData): string[] {
  const errors: string[] = [];
  if (!data.senderName.trim()) {
    errors.push('نام فرستنده الزامی است');
  }
  if (!data.recipientName.trim()) {
    errors.push('نام گیرنده الزامی است');
  }
  if (!data.subject.trim()) {
    errors.push('موضوع نامه الزامی است');
  }
  if (!data.salutation.trim()) {
    errors.push('متن سلام و احترام الزامی است');
  }
  if (!data.body.trim()) {
    errors.push('متن نامه الزامی است');
  }
  if (!data.closing.trim()) {
    errors.push('متن پایانی الزامی است');
  }
  if (!data.letterDate.trim()) {
    errors.push('تاریخ نامه الزامی است');
  }
  return errors;
}

export const FREE_BODY_LIMIT = 2000;

export function getSalutationForRecipient(
  recipientName: string,
  recipientPosition?: string,
): string {
  const position = recipientPosition
    ? `جناب آقای / سرکار خانم ${recipientName}، ${recipientPosition}`
    : `جناب آقای / سرکار خانم ${recipientName}`;
  return `${position}\n\nبا سلام و احترام`;
}

export function getDefaultClosing(letterType: LetterType): string {
  const closings: Record<LetterType, string> = {
    request: 'پیشاپیش از همکاری و مساعدت جناب‌عالی سپاسگزاریم.',
    complaint: 'امید است دستور فرمایید نسبت به رسیدگی به این موضوع اقدام لازم به عمل آید.',
    inquiry: 'خواهشمند است نتیجه استعلام را به این مرکز اعلام فرمایید.',
    introduction: 'از همکاری جناب‌عالی صمیمانه سپاسگزاریم.',
    notification: 'مقتضی است نسبت به انجام مفاد این ابلاغیه اقدام لازم معمول دارید.',
    'cover-letter': 'خواهشمند است مدارک پیوست را بررسی و نتیجه را اعلام فرمایید.',
  };
  return closings[letterType] ?? 'با تشکر و قدردانی';
}

export function getDefaultSalutation(): string {
  return 'با سلام و احترام';
}
