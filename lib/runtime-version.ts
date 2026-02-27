import packageJson from '@/package.json';

type RuntimeVersion = {
  version: string;
  commit: string | null;
};

const packageVersion = typeof packageJson.version === 'string' ? packageJson.version : '0.0.0';

function pickCommit(): string | null {
  const sha =
    process.env['NEXT_PUBLIC_GIT_SHA'] ??
    process.env['GITHUB_SHA'] ??
    process.env['VERCEL_GIT_COMMIT_SHA'] ??
    null;
  if (!sha) {
    return null;
  }
  return sha.slice(0, 12);
}

export function getRuntimeVersion(): RuntimeVersion {
  return {
    version: packageVersion,
    commit: pickCommit(),
  };
}
