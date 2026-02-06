import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const appRoot = join(process.cwd(), 'app');
const configPath = join(process.cwd(), 'lib', 'seo-featured-tools.json');
const registryPath = join(process.cwd(), 'lib', 'tools-registry.ts');
const featuredOgTools = JSON.parse(readFileSync(configPath, 'utf8'));

const template = (title, background, gradient) => `import { ImageResponse } from 'next/og';
import { siteName } from '@/lib/seo';
import { loadOgFont } from '@/lib/og-font';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const runtime = 'nodejs';

const title = '${title}';

export default async function OpenGraphImage() {
  const fontData = await loadOgFont();
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '${background}',
        backgroundImage: '${gradient}',
        color: '#f8fafc',
        fontSize: 64,
        fontWeight: 700,
        fontFamily: 'Vazirmatn',
        textAlign: 'center',
        padding: '60px',
      }}
    >
      {title} | {siteName}
    </div>,
    {
      ...size,
      fonts: [
        {
          name: 'Vazirmatn',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    },
  );
}
`;

const getCandidateDirs = (relativePath) => [
  join(appRoot, relativePath),
  join(appRoot, '(tools)', relativePath),
];

const registrySource = readFileSync(registryPath, 'utf8');
const registryPaths = new Set(
  Array.from(registrySource.matchAll(/path:\s*'([^']+)'/g)).map((match) => match[1]),
);

const missing = [];
const missingRegistry = [];

featuredOgTools.forEach((tool) => {
  const safePath = tool.path.replace(/^\/+/, '');
  const candidateDirs = getCandidateDirs(safePath);
  const routeExists = candidateDirs.some((dir) => existsSync(join(dir, 'page.tsx')));
  const inRegistry = registryPaths.has(tool.path);

  if (!routeExists) {
    missing.push(tool.path);
    return;
  }
  if (!inRegistry) {
    missingRegistry.push(tool.path);
  }

  const targetDir = candidateDirs.find((dir) => existsSync(join(dir, 'page.tsx'))) ?? candidateDirs[0];
  mkdirSync(targetDir, { recursive: true });
  const targetFile = join(targetDir, 'opengraph-image.tsx');
  writeFileSync(targetFile, template(tool.title, tool.background, tool.gradient), 'utf8');
});

if (missing.length > 0 || missingRegistry.length > 0) {
  if (missing.length > 0) {
    console.error(`Missing routes for OG images: ${missing.join(', ')}`);
  }
  if (missingRegistry.length > 0) {
    console.error(`Missing tools-registry entries for OG images: ${missingRegistry.join(', ')}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Generated ${featuredOgTools.length} opengraph images.`);
}
