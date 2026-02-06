/* eslint-disable no-console */
import { formatPersianDate, toPersianNumbers } from 'persian-tools/localization';

const now = new Date();
console.log(toPersianNumbers('Invoice 2024'));
console.log(formatPersianDate(now));
