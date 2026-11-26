export type StandaloneRuntime = {
  standaloneDir: string;
  serverPath: string;
  targetStatic: string;
  targetPublic: string;
};

export function resolveReleaseSha(rootDir?: string): string;
export function prepareStandaloneRuntime(rootDir?: string): StandaloneRuntime;
export function verifySmokeAsset(
  asset: { path: string; contentType: string },
  response: Response,
  expected: Buffer,
): Promise<void>;
export function runLocalSmoke(rootDir?: string): Promise<void>;
