import { copyFileSync, cpSync } from 'node:fs';

const source = 'node_modules/pdfjs-dist';
copyFileSync(`${source}/build/pdf.worker.min.mjs`, 'public/pdf.worker.min.mjs');
cpSync(`${source}/cmaps`, 'public/pdfjs/cmaps', { recursive: true });
