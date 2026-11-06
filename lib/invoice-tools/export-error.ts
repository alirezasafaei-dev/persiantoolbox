/** A bounded export fails visibly instead of truncating the invoice or exhausting the browser. */
export class InvoicePdfInputError extends Error {
  constructor() {
    super('INVOICE_INPUT_TOO_COMPLEX');
    this.name = 'InvoicePdfInputError';
  }
}
