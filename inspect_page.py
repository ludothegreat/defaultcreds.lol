#!/usr/bin/env python3
"""Inspect page using Chrome DevTools Protocol via WebSocket"""
import json
import websocket
import threading
import time

TAB_ID = "ED759F7B300A8BFD4F1BCC556E3A8835"
WS_URL = f"ws://127.0.0.1:9222/devtools/page/{TAB_ID}"

results = {}
result_lock = threading.Lock()

def on_message(ws, message):
    data = json.loads(message)
    if data.get('id'):
        with result_lock:
            results[data['id']] = data

def on_error(ws, error):
    print(f"WebSocket error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("WebSocket closed")

def evaluate_expression(ws, expression, call_id):
    """Send evaluation command"""
    command = {
        "id": call_id,
        "method": "Runtime.evaluate",
        "params": {
            "expression": expression,
            "returnByValue": True
        }
    }
    ws.send(json.dumps(command))

# Connect and evaluate
ws = websocket.WebSocketApp(WS_URL,
                          on_message=on_message,
                          on_error=on_error,
                          on_close=on_close)

ws_thread = threading.Thread(target=ws.run_forever)
ws_thread.daemon = True
ws_thread.start()

# Wait for connection
time.sleep(1)

# Enable Runtime domain
ws.send(json.dumps({"id": 1, "method": "Runtime.enable"}))
time.sleep(0.5)

# Evaluate expressions
call_id = 2
evaluate_expression(ws, """
JSON.stringify({
    feedOptions: Array.from(document.querySelectorAll('.feed-option')).map(el => ({
        selected: el.dataset.selected,
        active: el.dataset.active,
        name: el.querySelector('.feed-name')?.textContent?.trim() || 'N/A',
        checkbox: el.querySelector('input[type="checkbox"]')?.checked || false,
        hasBackground: window.getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)'
    })),
    categories: {
        popupVisible: !document.querySelector('#feed-filter-popup')?.hasAttribute('hidden'),
        checkboxes: Array.from(document.querySelectorAll('.feed-filter-checkbox')).map(cb => ({
            name: cb.value,
            checked: cb.checked
        }))
    },
    localStorage: {
        activeCategories: JSON.parse(localStorage.getItem('activeFeedCategories') || '[]'),
        selectedFeeds: JSON.parse(localStorage.getItem('selectedFeeds') || '[]')
    }
})
""", call_id)

time.sleep(2)

# Get results
with result_lock:
    if call_id in results:
        result = results[call_id]
        if result.get('result', {}).get('result', {}).get('value'):
            try:
                data = json.loads(result['result']['result']['value'])
                print(json.dumps(data, indent=2))
            except:
                print(json.dumps(result, indent=2))
    else:
        print("No result received")

ws.close()
