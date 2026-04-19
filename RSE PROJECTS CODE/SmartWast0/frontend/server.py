import os
from http.server import BaseHTTPRequestHandler, HTTPServer


PORT = int(os.environ.get("PORT", 8080))
API_URL = os.environ.get("API_URL", "http://localhost:8000")


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Toute URL -> servir code.html avec injection API_URL
        try:
            with open("code.html", "r", encoding="utf-8") as file:
                content = file.read()

            content = content.replace("%%API_BASE%%", API_URL)
            encoded = content.encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)
        except Exception as error:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(error).encode())

    def log_message(self, format, *args):
        print(f"[{self.address_string()}] {format % args}")


if __name__ == "__main__":
    httpd = HTTPServer(("", PORT), Handler)
    print(f"Serving on port {PORT} — API_URL={API_URL}")
    httpd.serve_forever()
