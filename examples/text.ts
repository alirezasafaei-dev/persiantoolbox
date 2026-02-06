import {
  cleanPersianText,
  normalizePersianChars,
  stripPersianDiacritics,
} from 'persian-tools/localization';

console.log(normalizePersianChars('كباب و يار'));
console.log(stripPersianDiacritics('سَلام'));
console.log(cleanPersianText('  كتابها  '));
