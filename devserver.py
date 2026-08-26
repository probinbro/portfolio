"""Tiny static server for local development.

python -m http.server caches aggressively, which means edited ES modules
keep serving stale from the browser's memory cache. This is the same
thing with no-store headers so a reload always reflects the files on disk.

    python devserver.py [port]

Development only — the deployed site is plain static files.
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):        # quieter console
        if "GET" in (fmt % args) and " 200 " not in (fmt % args):
            super().log_message(fmt, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4321
    handler = partial(NoCacheHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
        print(f"probin.dev running at http://localhost:{port}  (no-store, ctrl-c to stop)")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
