export const DISCLAIMER =
  'این ابزار صرفاً بر اساس اطلاعات واردشده توسط کاربر، پیش‌نویس قرارداد تولید می‌کند و جایگزین مشاوره حقوقی، وکالت، خدمات مشاور املاک، داوری یا ثبت رسمی نیست. مسئولیت صحت اطلاعات، بررسی نهایی، امضا، چاپ، ثبت، توافق طرفین و آثار حقوقی استفاده از قرارداد بر عهده کاربران است.';

export const DRAFT_WATERMARK = 'پیش‌نویس / غیرنهایی';

export type ContractTemplateId =
  | 'rental-lease'
  | 'construction-contractor'
  | 'service'
  | 'nda'
  | 'receipt';

export type PricingTier = 'free' | 'premium';

export type ReviewStatus = 'draft' | 'reviewed' | 'needs-legal-review';

export interface ContractField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[];
  group: string;
  groupLabel: string;
}

export interface ContractClause {
  id: string;
  title: string;
  text: string;
  required: boolean;
  defaultEnabled: boolean;
}

export interface ContractTemplate {
  templateId: ContractTemplateId;
  version: string;
  title: string;
  description: string;
  fields: ContractField[];
  requiredFields: string[];
  clauses: ContractClause[];
  optionalClauses: ContractClause[];
  disclaimers: string[];
  pricingTier: PricingTier;
  lastReviewedAt: string;
  reviewStatus: ReviewStatus;
}

export interface GeneratedContract {
  templateId: ContractTemplateId;
  templateVersion: string;
  createdAt: number;
  userInputs: Record<string, string>;
  selectedClauses: string[];
  renderedText: string;
  textHash: string;
  disclaimerAccepted: boolean;
}

export type RentalLeaseInputs = Record<string, string>;

export type ConstructionContractorInputs = Record<string, string>;

export function validateRentalLease(inputs: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  const required: Array<[string, string]> = [
    ['landlord.name', 'نام موجر الزامی است'],
    ['landlord.nationalId', 'کد ملی موجر الزامی است'],
    ['landlord.phone', 'تلفن موجر الزامی است'],
    ['landlord.address', 'آدرس موجر الزامی است'],
    ['tenant.name', 'نام مستأجر الزامی است'],
    ['tenant.nationalId', 'کد ملی مستأجر الزامی است'],
    ['tenant.phone', 'تلفن مستأجر الزامی است'],
    ['tenant.address', 'آدرس مستأجر الزامی است'],
    ['property.address', 'آدرس ملک الزامی است'],
    ['property.postalCode', 'کد پستی الزامی است'],
    ['property.area', 'متراژ الزامی است'],
    ['property.deedType', 'نوع سند الزامی است'],
    ['startDate', 'تاریخ شروع الزامی است'],
    ['endDate', 'تاریخ پایان الزامی است'],
    ['deliveryDate', 'تاریخ تحویل الزامی است'],
    ['depositAmount', 'مبلغ ودیعه الزامی است'],
    ['monthlyRent', 'مبلغ اجاره الزامی است'],
    ['paymentDay', 'روز پرداخت الزامی است'],
    ['paymentMethod', 'روش پرداخت الزامی است'],
  ];
  for (const [field, msg] of required) {
    if (!inputs[field]?.trim()) {
      errors[field] = msg;
    }
  }
  if (inputs['landlord.nationalId'] && !/^\d{10}$/.test(inputs['landlord.nationalId'])) {
    errors['landlord.nationalId'] = 'کد ملی باید ۱۰ رقمی باشد';
  }
  if (inputs['tenant.nationalId'] && !/^\d{10}$/.test(inputs['tenant.nationalId'])) {
    errors['tenant.nationalId'] = 'کد ملی باید ۱۰ رقمی باشد';
  }
  return errors;
}

export function validateConstructionContractor(
  inputs: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const required: Array<[string, string]> = [
    ['client.name', 'نام کارفرما الزامی است'],
    ['client.nationalId', 'کد ملی کارفرما الزامی است'],
    ['client.phone', 'تلفن کارفرما الزامی است'],
    ['client.address', 'آدرس کارفرما الزامی است'],
    ['contractor.name', 'نام پیمانکار الزامی است'],
    ['contractor.nationalId', 'کد ملی پیمانکار الزامی است'],
    ['contractor.phone', 'تلفن پیمانکار الزامی است'],
    ['contractor.address', 'آدرس پیمانکار الزامی است'],
    ['projectTitle', 'عنوان پروژه الزامی است'],
    ['projectAddress', 'آدرس پروژه الزامی است'],
    ['scopeOfWork', 'شرح خدمات الزامی است'],
    ['deliverables', 'تحویل‌ها الزامی است'],
    ['startDate', 'تاریخ شروع الزامی است'],
    ['endDate', 'تاریخ پایان الزامی است'],
    ['contractAmount', 'مبلغ قرارداد الزامی است'],
    ['paymentStructure', 'ساختار پرداخت الزامی است'],
  ];
  for (const [field, msg] of required) {
    if (!inputs[field]?.trim()) {
      errors[field] = msg;
    }
  }
  return errors;
}
