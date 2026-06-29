export type VehicleTemplateId = 'standard' | 'comprehensive';

export interface VehicleData {
  sellerName: string;
  sellerNationalId: string;
  sellerPhone: string;
  sellerAddress: string;
  buyerName: string;
  buyerNationalId: string;
  buyerPhone: string;
  buyerAddress: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  plateNumber: string;
  chassisNumber: string;
  engineNumber: string;
  vehicleType: string;
  mileage: string;
  salePrice: string;
  paymentMethod: string;
  paymentDate: string;
  deliveryDate: string;
  vehicleCondition: string;
  insuranceStatus: string;
  inspectionStatus: string;
  templateId: VehicleTemplateId;
  additionalClauses: string[];
  description?: string;
  witness1?: string;
  witness2?: string;
  sellerSignature?: string;
  buyerSignature?: string;
}

export interface VehicleTemplate {
  id: VehicleTemplateId;
  title: string;
  description: string;
}

export interface VehicleFeatureGate {
  canExportPdf: boolean;
  canExportDocx: boolean;
  canSaveDraft: boolean;
  maxDrafts: number;
  hasWatermark: boolean;
  availableTemplates: VehicleTemplateId[];
  canAddCustomClauses: boolean;
  canUseSignature: boolean;
}

export const DISCLAIMER =
  'این ابزار صرفاً برای ساخت پیش‌نویس مبایعه‌نامه خودرو بر اساس اطلاعات واردشده توسط کاربر است و جایگزین مشاوره حقوقی، وکالت، یا سند رسمی نیست. مسئولیت صحت اطلاعات، بررسی نهایی، امضا و آثار حقوقی استفاده از این قرارداد بر عهده کاربران است.';

export const PRIVACY_TEXT =
  'اطلاعات قرارداد در مرورگر شما پردازش می‌شود و برای ساخت خروجی نیازی به ارسال اطلاعات به سرور نیست.';

export const WATERMARK_TEXT = 'پیش‌نویس — ساخته‌شده با PersianToolbox';

export function validateVehicle(data: VehicleData): string[] {
  const errors: string[] = [];
  if (!data.sellerName.trim()) {
    errors.push('نام فروشنده الزامی است');
  }
  if (!data.sellerNationalId.trim()) {
    errors.push('کد ملی فروشنده الزامی است');
  }
  if (!data.sellerPhone.trim()) {
    errors.push('تلفن فروشنده الزامی است');
  }
  if (!data.buyerName.trim()) {
    errors.push('نام خریدار الزامی است');
  }
  if (!data.buyerNationalId.trim()) {
    errors.push('کد ملی خریدار الزامی است');
  }
  if (!data.buyerPhone.trim()) {
    errors.push('تلفن خریدار الزامی است');
  }
  if (!data.vehicleMake.trim()) {
    errors.push('سازنده خودرو الزامی است');
  }
  if (!data.vehicleModel.trim()) {
    errors.push('مدل خودرو الزامی است');
  }
  if (!data.vehicleYear.trim()) {
    errors.push('سال ساخت الزامی است');
  }
  if (!data.plateNumber.trim()) {
    errors.push('شماره پلاک الزامی است');
  }
  if (!data.salePrice.trim()) {
    errors.push('مبلغ فروش الزامی است');
  }
  if (!data.paymentMethod.trim()) {
    errors.push('روش پرداخت الزامی است');
  }
  return errors;
}
