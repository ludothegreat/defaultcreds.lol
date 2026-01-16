#!/usr/bin/env python3
"""Quick browser inspection script using Chrome DevTools Protocol"""
import json
import urllib.request
import urllib.parse

TAB_ID = "ED759F7B300A8BFD4F1BCC556E3A8835"
BASE_URL = f"http://127.0.0.1:9222/json/runtime/evaluate"

def evaluate(expression):
    """Evaluate JavaScript in the page context"""
    data = json.dumps({
        "expression": expression,
        "returnByValue": True
    }).encode('utf-8')
    
    req = urllib.request.Request(
        f"{BASE_URL}?objectGroup=console",
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            result = json.loads(response.read().decode('utf-8'))
            if result.get('result', {}).get('value'):
                return json.loads(result['result']['value'])
            return result
    except Exception as e:
        return {"error": str(e)}

# Get feed options state
print("=== Feed Options State ===")
feed_state = evaluate("""
JSON.stringify(Array.from(document.querySelectorAll('.feed-option')).map(el => ({
    selected: el.dataset.selected,
    active: el.dataset.active,
    name: el.querySelector('.feed-name')?.textContent?.trim() || 'N/A',
    checkbox: el.querySelector('input[type="checkbox"]')?.checked || false
})))
""")
print(json.dumps(feed_state, indent=2))

# Get category filter state
print("\n=== Category Filter State ===")
category_state = evaluate("""
JSON.stringify({
    popupVisible: !document.querySelector('#feed-filter-popup')?.hasAttribute('hidden'),
    checkboxes: Array.from(document.querySelectorAll('.feed-filter-checkbox')).map(cb => ({
        name: cb.value,
        checked: cb.checked
    })),
    activeCategories: JSON.parse(localStorage.getItem('activeFeedCategories') || '[]'),
    selectedFeeds: JSON.parse(localStorage.getItem('selectedFeeds') || '[]')
})
""")
print(json.dumps(category_state, indent=2))

# Get console errors
print("\n=== Checking for Console Errors ===")
errors = evaluate("""
(function() {
    const logs = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = function(...args) { logs.push(['log', args.join(' ')]); };
    console.error = function(...args) { logs.push(['error', args.join(' ')]); };
    console.warn = function(...args) { logs.push(['warn', args.join(' ')]); };
    
    setTimeout(() => {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
    }, 100);
    
    return JSON.stringify(logs);
})()
""")
print(json.dumps(errors, indent=2))
