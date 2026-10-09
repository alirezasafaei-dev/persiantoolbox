export function getGa4MeasurementId(): string | null {
  const id = process.env['NEXT_PUBLIC_GA4_MEASUREMENT_ID']?.trim() ?? '';
  return /^G-[A-Z0-9]+$/.test(id) ? id : null;
}

export function isGa4Enabled(): boolean {
  return process.env['NEXT_PUBLIC_GA4_ENABLED'] === '1' && getGa4MeasurementId() !== null;
}
