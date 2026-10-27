import http.client
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from serve import DemoHandler


class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), DemoHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def request(self, path):
        conn = http.client.HTTPConnection('127.0.0.1', self.server.server_port, timeout=2)
        conn.request('GET', path)
        response = conn.getresponse()
        body = response.read()
        headers = dict(response.getheaders())
        conn.close()
        return response.status, headers, body

    def test_app_and_assets_are_served_without_authentication(self):
        for path in ('/', '/index.html', '/assets/app.js', '/assets/styles.css'):
            status, headers, body = self.request(path)
            self.assertEqual(status, 200)
            self.assertTrue(body)
            self.assertNotIn('WWW-Authenticate', headers)
            self.assertIn("script-src 'self'", headers['Content-Security-Policy'])
            self.assertIn('https://openrouter.ai', headers['Content-Security-Policy'])

    def test_unpublished_files_and_traversal_are_blocked(self):
        for path in ('/README.md', '/.git/config', '/assets/../serve.py', '/assets/%2e%2e/serve.py'):
            self.assertEqual(self.request(path)[0], 404)

    def test_health_endpoint(self):
        status, _, body = self.request('/healthz')
        self.assertEqual((status, body), (200, b'ok\n'))


if __name__ == '__main__':
    unittest.main()
