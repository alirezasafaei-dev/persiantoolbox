"""Test shell transaction/restore behavior with process mocks confined to a temp tree.

The Node configuration transform is tested independently against real nginx text.
No real nginx, sudo operation, listener or production endpoint is used here.
"""
import os
import pathlib
import subprocess
import tempfile
import unittest


MOCK = r'''#!/usr/bin/env python3
import os, pathlib, shutil, subprocess, sys
root = pathlib.Path(os.environ['FONT_TEST_ROOT'])
case = os.environ['FONT_TEST_CASE']
target = root / 'nginx' / 'site.conf'
args = sys.argv[1:]
name = pathlib.Path(sys.argv[0]).name
if name == 'node':
    if args[1] == '--select':
        pathlib.Path(args[3]).write_text(str(target if case != 'unsafe-target' else root / 'outside.conf'))
    else:
        text = pathlib.Path(args[2]).read_text()
        pathlib.Path(args[3]).write_text(text.replace('alias legacy;', 'proxy_pass active;'))
elif name == 'curl':
    public = args[-1].startswith('https:')
    data = b'fixture-font'
    if (public and case == 'public-failure') or (not public and case == 'loopback-failure'):
        data += b'bad'
    pathlib.Path(args[args.index('-o') + 1]).write_bytes(data)
    print('200\tfont/ttf\t' + str(len(data)), end='')
elif name == 'sudo':
    command = args[0]
    if command == 'nginx':
        if args[1] == '-T':
            print('fixture inventory')
        elif case == 'syntax-failure' and 'proxy_pass' in target.read_text():
            sys.exit(1)
    elif command == 'systemctl':
        counter = root / 'reloads'
        n = int(counter.read_text()) + 1 if counter.exists() else 1
        counter.write_text(str(n))
        if case == 'reload-failure' and n == 1:
            sys.exit(1)
    else:
        if command not in ['mktemp', 'install', 'mv', 'rm', 'readlink', 'cat', 'stat', 'cmp']:
            raise RuntimeError('Unexpected command')
        sys.exit(subprocess.run(args).returncode)
else:
    raise RuntimeError('Unexpected mock')
'''


class Reconciliation(unittest.TestCase):
    def test_transaction(self):
        library = str(pathlib.Path('scripts/deploy/reconcile-font-routing.sh').resolve())
        for case in ['valid', 'idempotent', 'loopback-failure', 'public-failure',
                     'syntax-failure', 'reload-failure', 'unsafe-target']:
            with self.subTest(case=case), tempfile.TemporaryDirectory() as directory:
                root = pathlib.Path(directory)
                for name in ['bin', 'state', 'nginx', 'release/.next/standalone/public/fonts']:
                    (root / name).mkdir(parents=True)
                for name in ['node', 'curl', 'sudo']:
                    executable = root / 'bin' / name
                    executable.write_text(MOCK)
                    executable.chmod(0o700)
                for weight in ['Regular', 'Bold']:
                    (root / f'release/.next/standalone/public/fonts/Vazirmatn-{weight}.ttf').write_bytes(b'fixture-font')
                original = 'proxy_pass active;\n' if case == 'idempotent' else 'alias legacy;\n'
                target = root / 'nginx/site.conf'
                target.write_text(original)
                target.chmod(0o640)
                (root / 'outside.conf').write_text(original)
                result = subprocess.run(
                    ['bash', '-c', 'source "$1"; reconcile_invoice_font_routing "$2" "$3" 3004 https://example.invalid "$4" "$5"',
                     'test', library, str(root), str(root / 'release'), str(root / 'state'), str(root / 'nginx')],
                    env={**os.environ, 'PATH': f'{root / "bin"}:{os.environ["PATH"]}',
                         'FONT_TEST_ROOT': directory, 'FONT_TEST_CASE': case},
                    capture_output=True, text=True, timeout=20,
                )
                success = case in ['valid', 'idempotent']
                self.assertEqual(result.returncode == 0, success, result.stderr)
                self.assertEqual(target.read_text(), 'proxy_pass active;\n' if success else original)
                self.assertEqual(target.stat().st_mode & 0o777, 0o640)
                self.assertEqual((root / 'outside.conf').read_text(), original)
                self.assertFalse(list((root / 'state').glob('invoice-font-routing.*')))
                self.assertFalse(list((root / 'nginx').glob('*.invoice-font.*')))
                backups = list((root / 'state').glob('invoice-font-before-*.conf'))
                self.assertEqual(bool(backups), case in ['valid', 'public-failure', 'syntax-failure', 'reload-failure'])
                for backup in backups:
                    self.assertEqual(backup.stat().st_mode & 0o777, 0o600)
                    self.assertEqual(backup.read_text(), original)


if __name__ == '__main__':
    unittest.main()
