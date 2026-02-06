import { bench, describe } from 'vitest';
import { numberToWordsFa, parseLooseNumber, toEnglishDigits } from '../shared/utils/numbers/number';

describe('number utils benchmarks', () => {
  bench('toEnglishDigits', () => {
    toEnglishDigits('۱۲۳٬۴۵۶٫۷۸۹');
  });

  bench('parseLooseNumber', () => {
    parseLooseNumber('۱۲٬۳۴۵٬۶۷۸٫۹۰');
  });

  bench('numberToWordsFa', () => {
    numberToWordsFa(123456789);
  });
});
