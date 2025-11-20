
from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = browser.new_page()

    # Wait for server to be ready
    time.sleep(5)

    try:
        # Go to calendar page
        page.goto("http://127.0.0.1:4173/calendar")

        # Wait for the grid to render
        page.wait_for_selector("div[role='grid']", state="visible")

        # Take screenshot of the calendar
        page.screenshot(path="verification/calendar_improved.png")

        # Check if we can see semantic buttons
        buttons = page.locator("button[role='gridcell']")
        print(f"Found {buttons.count()} day cells as buttons")

    except Exception as e:
        print(f"Error: {e}")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
