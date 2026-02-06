/* eslint-disable no-console */
import { formatMoneyFa, numberToWordsFa, parseLooseNumber } from 'persian-tools/numbers';

const input = '۱۲٬۳۴۵٫۶۷';
const parsed = parseLooseNumber(input);

console.log({
  input,
  parsed,
  words: numberToWordsFa(parsed ?? 0),
  money: formatMoneyFa(parsed ?? 0),
});
