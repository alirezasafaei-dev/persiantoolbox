import {
  calculateCompoundInterest,
  calculateTax,
  convertRialToToman,
  convertTomanToRial,
} from 'persian-tools/finance';

const compound = calculateCompoundInterest({
  principal: 1_000_000,
  annualRatePercent: 18,
  years: 2,
  timesPerYear: 12,
});

const tax = calculateTax(1_000_000, 9);

console.log('compound total', Math.round(compound.total));
console.log('tax total', tax.totalWithTax);
console.log('rial->toman', convertRialToToman(250_000));
console.log('toman->rial', convertTomanToRial(25_000));
