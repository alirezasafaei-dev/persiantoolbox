import packageJson from '@/package.json';

type RuntimeVersion = {
  version: string;
  commit: string | null;
  branch: string | null;
  builtAt: string | null;
};

const packageVersion = typeof packageJson.version === 'string' ? packageJson.version : '0.0.0';

function pickCommit(): string | null {
  const sha =
    process.env['NEXT_PUBLIC_GIT_SHA'] ??
    process.env['GIT_COMMIT'] ??
    process.env['RELEASE_GIT_SHA'] ??
    process.env['GITHUB_SHA'] ??
    process.env['VERCEL_GIT_COMMIT_SHA'] ??
    null;
  if (!sha) {
    return null;
  }
  return sha.slice(0, 12);
}

function pickBranch(): string | null {
  return (
    process.env['NEXT_PUBLIC_GIT_BRANCH'] ??
    process.env['GIT_BRANCH'] ??
    process.env['RELEASE_GIT_BRANCH'] ??
    process.env['VERCEL_GIT_COMMIT_REF'] ??
    null
  );
}

function pickBuildTimestamp(): string | null {
  return (
    process.env['NEXT_PUBLIC_BUILD_DATE'] ??
    process.env['BUILD_TIMESTAMP'] ??
    process.env['RELEASE_BUILT_AT'] ??
    null
  );
}

export function getRuntimeVersion(): RuntimeVersion {
  return {
    version: packageVersion,
    commit: pickCommit(),
    branch: pickBranch(),
    builtAt: pickBuildTimestamp(),
  };
}
