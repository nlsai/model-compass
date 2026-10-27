#!/usr/bin/env python3
"""Local-only, dependency-free server for the Model Compass demo."""
from argparse import ArgumentParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
ALLOWED = frozenset(("/", "/index.html", "/assets/app.js", "/assets/styles.css"))
CSP = ("default-src 'self'; script-src 'self'; style-src 'self'; "
       "connect-src 'self' https://openrouter.ai; img-src 'self' data:; "
       "object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'")


class DemoHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        path = unquote(urlsplit(self.path).path)
        if path == '/healthz':
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Content-Length', '3')
            self.end_headers()
            from io import BytesIO
            return BytesIO(b'ok\n')
        if path not in ALLOWED:
            self.send_error(404, 'Not found')
            return None
        return super().send_head()

    def end_headers(self):
        self.send_header('Content-Security-Policy', CSP)
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


def main():
    parser = ArgumentParser(description='Run Model Compass on your own machine.')
    parser.add_argument('--host', default='127.0.0.1', help='Bind address (default: 127.0.0.1)')
    parser.add_argument('--port', type=int, default=8000, help='Port (default: 8000)')
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error('port must be between 1 and 65535')
    server = ThreadingHTTPServer((args.host, args.port), DemoHandler)
    print(f'Model Compass is running at http://{args.host}:{args.port}/', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
