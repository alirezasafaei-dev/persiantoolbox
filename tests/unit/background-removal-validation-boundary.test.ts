import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const distDir = path.dirname(require.resolve('@imgly/background-removal'));
const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));

describe('reviewed background-removal validation boundary', () => {
  it('preserves the exported Config type even with skipLibCheck enabled', () => {
    const filename = path.join(process.cwd(), 'tests/unit/background-removal-type-probe.ts');
    const text = `import type { Config } from '@imgly/background-removal';
      type IsAny<T> = 0 extends (1 & T) ? true : false;
      const mustRemainTyped: IsAny<Config> = false;
      // @ts-expect-error Invalid model must remain rejected by the exported type.
      const invalid: Config = { model: 'invalid-synthetic-model' };
      void mustRemainTyped; void invalid;`;
    const options: ts.CompilerOptions = {
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      types: [],
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    };
    const host = ts.createCompilerHost(options);
    const read = host.getSourceFile.bind(host);
    host.getSourceFile = (file, language, onError, createNew) =>
      path.resolve(file) === filename
        ? ts.createSourceFile(file, text, language, true)
        : read(file, language, onError, createNew);
    const program = ts.createProgram([filename], options, host);
    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
    ).toEqual([]);
  }, 30000);

  it('pins the reviewed package and updates only its unused declared Zod edge', () => {
    expect(pkg.dependencies['@imgly/background-removal']).toBe('1.7.0');
    expect(pkg.pnpm.overrides['@imgly/background-removal@1.7.0>zod']).toBe('4.6.6');
  });

  for (const format of ['mjs', 'cjs']) {
    it(`requires renewed review if the ${format} bundle changes its validator boundary`, () => {
      const source = fs.readFileSync(path.join(distDir, `index.${format}`), 'utf8');
      expect(source).toContain('zod@3.24.2');
      expect(source).not.toMatch(/(?:from\s*|require\s*\(|import\s*\()\s*["']zod(?:[/"'])/);
      const start = source.indexOf('var ConfigSchema =');
      const end = source.indexOf('function validateConfig', start);
      expect(start).toBeGreaterThan(0);
      expect(end).toBeGreaterThan(start);
      const schema = source.slice(start, end);
      expect(schema).toContain('z.object({');
      expect(schema).not.toMatch(/z\.(?:array|set|map)\s*\(/);
      expect(schema).toContain('z.function().args(z.string(), z.number(), z.number())');
      const exports =
        format === 'mjs'
          ? source.match(/export\s*\{([^}]+)\}/s)?.[1]
          : source.match(/__export\(src_exports,\s*\{([^}]+)\}/s)?.[1];
      expect(exports).toBeDefined();
      expect(exports).not.toMatch(/\b(?:ConfigSchema|validateConfig|z)\b/);
    });
  }

  it('passes only a fixed progress callback, never user configuration, to the package', () => {
    const filename = 'components/features/image-tools/image-background-remover.tsx';
    const source = ts.createSourceFile(
      filename,
      fs.readFileSync(filename, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const calls: ts.CallExpression[] = [];
    function visit(node: ts.Node) {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'removeBackground'
      )
        calls.push(node);
      ts.forEachChild(node, visit);
    }
    visit(source);
    expect(calls).toHaveLength(1);
    const call = calls[0];
    if (!call) throw new Error('Reviewed package call is missing');
    const [file, config] = call.arguments;
    if (!file || !config) throw new Error('Reviewed package arguments are missing');
    expect(file.getText(source)).toBe('file');
    expect(ts.isObjectLiteralExpression(config)).toBe(true);
    if (!ts.isObjectLiteralExpression(config))
      throw new Error('Configuration needs renewed security review');
    expect(config.properties).toHaveLength(1);
    const progress = config.properties[0];
    if (!progress) throw new Error('Reviewed progress callback is missing');
    expect(ts.isPropertyAssignment(progress)).toBe(true);
    if (!ts.isPropertyAssignment(progress)) throw new Error('Configuration spread is not reviewed');
    expect(progress.name.getText(source)).toBe('progress');
    expect(ts.isArrowFunction(progress.initializer)).toBe(true);
  });

  it('requires review when another production source imports the package', () => {
    const importers: string[] = [];
    function scan(dir: string) {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) scan(file);
        else if (
          /\.[cm]?[jt]sx?$/.test(file) &&
          /(?:from\s*|import\s*\(|require\s*\()\s*['"]@imgly\/background-removal['"]/.test(
            fs.readFileSync(file, 'utf8'),
          )
        ) {
          importers.push(file.split(path.sep).join('/'));
        }
      }
    }
    for (const dir of ['app', 'components', 'features', 'lib', 'shared', 'hooks', 'workers', 'src'])
      scan(dir);
    expect(importers).toEqual(['components/features/image-tools/image-background-remover.tsx']);
  });
});
