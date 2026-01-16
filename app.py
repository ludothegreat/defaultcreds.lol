#!/usr/bin/env python3
"""
Flask server for defaultcreds.lol
Serves static files properly to avoid file:// protocol issues
"""

from flask import Flask, send_from_directory, send_file
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)  # Enable CORS for all routes

@app.route('/')
def index():
    """Serve the main index.html"""
    return send_file('index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files (JS, CSS, JSON, etc.)"""
    # Security: prevent directory traversal
    if '..' in path or path.startswith('/'):
        return "Forbidden", 403
    
    # Check if file exists
    if os.path.isfile(path):
        return send_from_directory('.', path)
    else:
        return "Not Found", 404

if __name__ == '__main__':
    print("Starting Flask server for defaultcreds.lol")
    print("Server running at http://localhost:8000")
    print("Press Ctrl+C to stop")
    # Run on localhost by default, port 8000
    app.run(host='127.0.0.1', port=8000, debug=True)
