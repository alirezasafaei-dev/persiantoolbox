"""Exercise the real Bash asset gate against HTTP responses; no external network."""
import http.server
import os
import pathlib
import subprocess
import tempfile
import threading
import unittest


class FontVerifier(unittest.TestCase):
    def test_font_response_contract(self):
        mode = ['valid']
        names = ['Vazirmatn-Regular.woff2', 'Vazirmatn-SemiBold.woff2',
                 'Vazirmatn-Bold.woff2', 'Vazirmatn-Regular.ttf', 'Vazirmatn-Bold.ttf']
        fonts = {name: (b'wOF2' if name.endswith('woff2') else b'\x00\x01\x00\x00') + b'font-fixture' for name in names}

        class Handler(http.server.BaseHTTPRequestHandler):
            def log_message(self, *_args):
                pass

            def do_GET(self):
                status, mime = 200, 'text/html'
                body = b'<script src="/_next/static/test.js"></script><link href="/_next/static/test.css">'
                if self.path.startswith('/fonts/'):
                    name = self.path.removeprefix('/fonts/')
                    body = fonts[name]
                    mime = 'font/ttf' if name.endswith('ttf') else 'font/woff2'
                    if name == 'Vazirmatn-Regular.ttf':
                        if mode[0] == 'missing':
                            status = 404
                        elif mode[0] == 'wrong-mime':
                            mime = 'text/html'
                        elif mode[0] == 'empty':
                            body = b''
                        elif mode[0] == 'corrupt':
                            body += b'wrong-bytes'
                elif self.path.endswith('.js'):
                    mime, body = 'application/javascript', b'console.log(1)'
                elif self.path.endswith('.css'):
                    mime, body = 'text/css', b'body{}'
                self.send_response(status)
                self.send_header('Content-Type', mime)
                self.send_header('Cache-Control', 'no-store')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)

        with tempfile.TemporaryDirectory() as directory:
            for name, data in fonts.items():
                pathlib.Path(directory, name).write_bytes(data)
            server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                for case in ['valid', 'missing', 'wrong-mime', 'empty', 'corrupt']:
                    with self.subTest(case=case):
                        mode[0] = case
                        result = subprocess.run(
                            ['bash', 'scripts/deploy/verify-release-assets.sh', f'http://127.0.0.1:{server.server_port}'],
                            env={**os.environ, 'VERIFY_HEALTH': 'false', 'FONT_REFERENCE_DIR': directory},
                            capture_output=True, text=True, timeout=45,
                        )
                        self.assertEqual(result.returncode == 0, case == 'valid', result.stderr)
                # Simulate a previous release whose fonts intentionally differ
                # from the current checkout. The supplied reference controls it.
                mode[0] = 'valid'
                for name in names:
                    fonts[name] += b'previous-release'
                    pathlib.Path(directory, name).write_bytes(fonts[name])
                previous = subprocess.run(
                    ['bash', 'scripts/deploy/verify-release-assets.sh', f'http://127.0.0.1:{server.server_port}'],
                    env={**os.environ, 'VERIFY_HEALTH': 'false', 'FONT_REFERENCE_DIR': directory},
                    capture_output=True, text=True, timeout=45,
                )
                self.assertEqual(previous.returncode, 0, previous.stderr)
            finally:
                server.shutdown()
                server.server_close()
                thread.join()


if __name__ == '__main__':
    unittest.main()
