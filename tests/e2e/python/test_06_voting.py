import re

from playwright.sync_api import Page, expect


def test_vote_button_increments_vote_count(page: Page):
    page.goto("./")
    page.wait_for_selector("article")
    page.locator("article").first.locator("a[href*='/talks/']").last.click()
    page.wait_for_url(re.compile(r"/talks/.+"))

    count_el = page.locator('[data-testid="vote-count"]')
    before = int(count_el.text_content() or "0")

    page.click('[data-testid="vote-button"]')

    expect(page.locator('[data-testid="vote-button"]')).to_contain_text("Already voted")
    after = int(count_el.text_content() or "0")
    assert after == before + 1


def test_vote_button_is_disabled_after_voting(page: Page):
    page.goto("./")
    page.wait_for_selector("article")
    page.locator("article").first.locator("a[href*='/talks/']").last.click()
    page.wait_for_url(re.compile(r"/talks/.+"))

    page.click('[data-testid="vote-button"]')
    expect(page.locator('[data-testid="vote-button"]')).to_be_disabled()


def test_reload_page_still_shows_already_voted_state(page: Page):
    page.goto("./")
    page.wait_for_selector("article")
    page.locator("article").first.locator("a[href*='/talks/']").last.click()
    page.wait_for_url(re.compile(r"/talks/.+"))
    url = page.url

    page.click('[data-testid="vote-button"]')
    expect(page.locator('[data-testid="vote-button"]')).to_contain_text("Already voted")

    page.goto(url)
    expect(page.locator('[data-testid="vote-button"]')).to_contain_text("Already voted")
