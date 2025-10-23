
import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Navigate to the correct calendar route
        await page.goto("http://127.0.0.1:8080/calendar")

        # Wait for the calendar to be visible
        await expect(page.locator(".grid.grid-cols-7")).to_be_visible()

        # Take the final verification screenshot
        await page.screenshot(path="jules-scratch/verification/calendar_verification.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
