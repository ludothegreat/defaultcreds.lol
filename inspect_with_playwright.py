#!/usr/bin/env python3
"""Inspect page using Playwright connected to existing Chrome"""
from playwright.sync_api import sync_playwright
import json

# Connect to existing Chrome via CDP
with sync_playwright() as p:
    # Connect to existing browser
    browser = p.chromium.connect_over_cdp("http://127.0.0.1:9222")
    
    # Get the page (CDP connection gives us existing pages)
    contexts = browser.contexts
    if contexts and contexts[0].pages:
        page = contexts[0].pages[0]
        
        # Wait for page to be ready
        page.wait_for_load_state('networkidle', timeout=5000)
        
        print("=== Page State ===")
        print(f"Title: {page.title()}")
        print(f"URL: {page.url}")
        
        # Get feed options state
        print("\n=== Feed Options State ===")
        feed_state = page.evaluate("""
        () => {
            const options = Array.from(document.querySelectorAll('.feed-option'));
            return options.map(el => ({
                selected: el.dataset.selected,
                active: el.dataset.active,
                name: el.querySelector('.feed-name')?.textContent?.trim() || 'N/A',
                checkbox: el.querySelector('input[type="checkbox"]')?.checked || false,
                backgroundColor: window.getComputedStyle(el).backgroundColor,
                opacity: window.getComputedStyle(el).opacity
            }));
        }
        """)
        print(json.dumps(feed_state, indent=2))
        
        # Get category filter state
        print("\n=== Category Filter State ===")
        category_state = page.evaluate("""
        () => {
            const popup = document.querySelector('#feed-filter-popup');
            return {
                popupVisible: !popup?.hasAttribute('hidden'),
                popupDisplay: popup ? window.getComputedStyle(popup).display : 'none',
                checkboxes: Array.from(document.querySelectorAll('.feed-filter-checkbox')).map(cb => ({
                    name: cb.value,
                    checked: cb.checked
                })),
                activeCategories: JSON.parse(localStorage.getItem('activeFeedCategories') || '[]'),
                selectedFeeds: JSON.parse(localStorage.getItem('selectedFeeds') || '[]')
            };
        }
        """)
        print(json.dumps(category_state, indent=2))
        
        # Check console errors
        console_messages = []
        page.on("console", lambda msg: console_messages.append({"type": msg.type, "text": msg.text}))
        page.on("pageerror", lambda err: console_messages.append({"type": "error", "text": str(err)}))
        
        # Trigger some interactions to see state changes
        print("\n=== Testing Feed Checkbox Click ===")
        # Click first checkbox if available
        first_checkbox = page.query_selector('.feed-option input[type="checkbox"]')
        if first_checkbox:
            initial_state = page.evaluate("""
            () => {
                const el = document.querySelector('.feed-option');
                return {
                    dataSelected: el?.dataset.selected,
                    checkboxChecked: document.querySelector('.feed-option input[type="checkbox"]')?.checked,
                    backgroundColor: el ? window.getComputedStyle(el).backgroundColor : 'none'
                };
            }
            """)
            print("Before click:", json.dumps(initial_state, indent=2))
            
            first_checkbox.click()
            page.wait_for_timeout(500)  # Wait for any updates
            
            after_state = page.evaluate("""
            () => {
                const el = document.querySelector('.feed-option');
                return {
                    dataSelected: el?.dataset.selected,
                    checkboxChecked: document.querySelector('.feed-option input[type="checkbox"]')?.checked,
                    backgroundColor: el ? window.getComputedStyle(el).backgroundColor : 'none'
                };
            }
            """)
            print("After click:", json.dumps(after_state, indent=2))
        
        # Test category filter
        print("\n=== Testing Category Filter ===")
        filter_btn = page.query_selector('#feed-filter-btn')
        if filter_btn:
            filter_btn.click()
            page.wait_for_timeout(300)
            popup_state = page.evaluate("""
            () => {
                const popup = document.querySelector('#feed-filter-popup');
                return {
                    hidden: popup?.hasAttribute('hidden'),
                    display: popup ? window.getComputedStyle(popup).display : 'none',
                    checkboxes: Array.from(document.querySelectorAll('.feed-filter-checkbox')).length
                };
            }
            """)
            print("Filter popup state:", json.dumps(popup_state, indent=2))
        
        print("\n=== Console Messages Captured ===")
        print(json.dumps(console_messages, indent=2))
        
    else:
        print("No pages found in browser")
