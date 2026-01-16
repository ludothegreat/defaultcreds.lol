# Running the Development Server

## Option 1: Flask Server (Recommended)

The Flask server properly serves all static files and avoids `file://` protocol issues.

### Setup
```bash
# Install dependencies (if needed)
pip3 install Flask flask-cors --user
# or with system packages flag if needed:
pip3 install Flask flask-cors --break-system-packages
```

### Run
```bash
python3 app.py
```

Server will start at: `http://localhost:8000`

### Stop
Press `Ctrl+C` in the terminal

---

## Option 2: Python Simple HTTP Server

```bash
python3 -m http.server 8000
```

Server will start at: `http://localhost:8000`

---

## Option 3: Original HTTPS Server

```bash
# Requires cert.pem and key.pem files
python3 server.py
```

Server will start at: `https://localhost:8000`

---

## Why Use a Server?

Opening `index.html` directly via `file://` protocol causes:
- CORS errors when fetching `creds.json`
- Network errors when loading `top_1000_passwords.txt`
- Some browser security restrictions

Using a local server (HTTP/HTTPS) resolves these issues.
