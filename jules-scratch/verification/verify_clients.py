import sys
import re
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    Navigates to the clients page, creates a new client, and verifies it was created.
    """
    try:
        # Navigate to the clients page.
        page.goto("http://127.0.0.1:8080/clients", timeout=60000)

        # Wait for the main heading to be visible.
        expect(page.get_by_role("heading", name="Clientes")).to_be_visible(timeout=30000)

        # Click the "Novo Cliente" button to open the creation dialog.
        page.get_by_role("button", name="Novo Cliente").click()

        # Wait for the dialog to appear.
        dialog = page.get_by_role("dialog")
        expect(dialog).to_be_visible()
        expect(dialog.get_by_role("heading", name="Cadastrar Novo Cliente"))

        # Fill in the form.
        unique_name = f"Teste Playwright {java.util.UUID.randomUUID().toString()}"
        page.get_by_label("Nome").fill(unique_name)
        page.get_by_label("Documento").fill("12345678901")
        page.get_by_label("Email").fill("teste@playwright.com")
        page.get_by_label("Telefone").fill("123456789")

        # Click the "Salvar" button.
        page.get_by_role("button", name="Salvar").click()

        # Wait for the dialog to disappear.
        expect(dialog).not_to_be_visible()

        # Verify that the new client appears in the table.
        expect(page.get_by_role("cell", name=unique_name)).to_be_visible()

        # Take a screenshot for visual confirmation.
        screenshot_path = "jules-scratch/verification/clients_verification.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot successfully saved to {screenshot_path}")

    except Exception as e:
        print(f"Error during Playwright verification: {e}", file=sys.stderr)
        page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        sys.exit(1)

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()

if __name__ == "__main__":
    main()
