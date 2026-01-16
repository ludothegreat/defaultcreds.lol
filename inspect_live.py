#!/usr/bin/env python3
"""Inspect live page state using Chrome DevTools Protocol"""
import json
import urllib.request
import time

def get_tabs():
    """Get list of open tabs"""
    try:
        with urllib.request.urlopen('http://127.0.0.1:9222/json/list', timeout=2) as f:
            return json.loads(f.read().decode())
    except:
        return []

def send_command(method, params=None):
    """Send CDP command via HTTP (limited, but works for some commands)"""
    # CDP primarily uses WebSocket, but we can try HTTP for simple commands
    # Actually, CDP doesn't support HTTP POST for commands - need WebSocket
    # Let me use a different approach - get page source and analyze
    pass

# Get tabs
tabs = get_tabs()
if tabs:
    tab = tabs[0]
    print(f"Connected to: {tab['title']}")
    print(f"URL: {tab['url']}")
    print(f"WebSocket: {tab.get('webSocketDebuggerUrl', 'N/A')}")
    
    # Try to get page source via CDP (this requires WebSocket, but let's try a workaround)
    # Actually, let's use a simpler approach - inject a script tag that reports state
    print("\n=== Attempting to inspect page state ===")
    print("Note: Full CDP requires WebSocket connection")
    print("Chrome DevTools Protocol is available at:", tab.get('webSocketDebuggerUrl'))
else:
    print("No tabs found")
