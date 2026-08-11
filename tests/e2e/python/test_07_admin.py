import re
import time

from playwright.sync_api import Page, expect


def test_approved_talk_appears_as_approved_in_the_main_list(page: Page):
    page.goto("./#/submit")
    title = f"Admin Approve Test {int(time.time() * 1000)}"
    page.fill('[data-testid="input-title"]', title)
    page.fill('[data-testid="input-speakerName"]', "Admin Tester")
    page.fill('[data-testid="input-abstract"]', "Testing admin approval flow end to end.")
    page.select_option('[data-testid="input-track"]', "devops")
    page.select_option('[data-testid="input-level"]', "intermediate")
    page.click('[data-testid="submit-button"]')
    page.wait_for_url(re.compile(r"/talks/.+"))

    page.goto("./#/admin")
    page.wait_for_selector(f"text={title}")
    talk_row = page.locator('[data-testid^="admin-talk-"]', has_text=title)
    talk_row.locator('[data-testid^="approve-"]').click()
    page.wait_for_timeout(300)

    expect(page.locator(f"text={title}")).not_to_be_visible()

    page.goto("./")
    page.wait_for_selector("article")
    with page.expect_response(lambda r: "/api/talks" in r.url and r.status == 200):
        page.select_option('[data-testid="filter-status"]', "approved")
    expect(page.locator(f"text={title}")).to_be_visible()
