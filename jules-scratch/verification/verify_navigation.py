
import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        await page.goto("http://127.0.0.1:8080/")

        nav_links = [
            "Dashboard",
            "Obrigações",
            "Impostos",
            "Parcelamentos",
            "Clientes",
            "Agenda",
            "Análises"
        ]

        for link_name in nav_links:
            try:
                print(f"Navigating to {link_name}...")
                await page.get_by_role("link", name=link_name).click()
                await page.wait_for_timeout(2000) # Wait for page to settle
                screenshot_path = f"jules-scratch/verification/nav_to_{link_name.lower()}.png"
                await page.screenshot(path=screenshot_path)
                print(f"  ... success, screenshot at {screenshot_path}")
            except Exception as e:
                print(f"  ... FAILED to navigate to {link_name}: {e}")
                await page.screenshot(path="jules-scratch/verification/nav_error.png")
                break

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
