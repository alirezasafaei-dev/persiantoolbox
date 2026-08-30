import { copyFileSync, existsSync } from 'node:fs';

const source = 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs';
const target = 'public/pdf.worker.min.mjs';
if (existsSync(source)) copyFileSync(source, target);
