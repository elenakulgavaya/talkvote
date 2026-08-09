import re
import time

from playwright.sync_api import Page, expect


def test_submits_a_valid_talk_and_redirects_to_detail_page(page: Page):
    page.goto("./#/submit")
    expect(page.locator("h1")).to_contain_text("Submit a Talk")

    page.fill('[data-testid="input-title"]', "E2E Test Talk")
    page.fill('[data-testid="input-speakerName"]', "Test Speaker")
    page.fill('[data-testid="input-abstract"]', "This is an abstract for the E2E test talk.")
    page.select_option('[data-testid="input-track"]', "qa")
    page.select_option('[data-testid="input-level"]', "intermediate")
    page.click('[data-testid="submit-button"]')

    expect(page).to_have_url(re.compile(r"/talks/.+"))
    expect(page.locator("h1")).to_contain_text("E2E Test Talk")


def test_new_talk_appears_on_the_list_with_status_submitted(page: Page):
    page.goto("./#/submit")

    unique_title = f"Auto Talk {int(time.time() * 1000)}"
    page.fill('[data-testid="input-title"]', unique_title)
    page.fill('[data-testid="input-speakerName"]', "Auto Speaker")
    page.fill('[data-testid="input-abstract"]', "Abstract for automated submission test.")
    page.select_option('[data-testid="input-track"]', "backend")
    page.select_option('[data-testid="input-level"]', "advanced")
    page.click('[data-testid="submit-button"]')
    page.wait_for_url(re.compile(r"/talks/.+"))

    page.goto("./")
    page.wait_for_selector("article")
    expect(page.locator(f"text={unique_title}")).to_be_visible()
