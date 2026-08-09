import re

from playwright.sync_api import Page, expect


def test_shows_correct_title_speaker_abstract_and_vote_count(page: Page):
    page.goto("./")
    page.wait_for_selector("article")

    first_card = page.locator("article").first
    title_text = first_card.locator("h2").text_content().strip()
    speaker_text = first_card.locator("p").first.text_content().strip()

    first_card.locator("a[href*='/talks/']").last.click()
    page.wait_for_url(re.compile(r"/talks/.+"))

    expect(page.locator("h1")).to_contain_text(title_text)
    expect(page.locator("p").first).to_contain_text(speaker_text.replace("by ", ""))
    expect(page.locator('[data-testid="vote-count"]')).to_be_visible()


def test_back_link_returns_to_list(page: Page):
    page.goto("./")
    page.wait_for_selector("article")

    page.locator("article").first.locator("a[href*='/talks/']").last.click()
    page.wait_for_url(re.compile(r"/talks/.+"))

    page.click("text=← Back to list")
    expect(page).to_have_url(re.compile(r"/$"))
