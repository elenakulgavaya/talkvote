import re

from playwright.sync_api import Page, expect


def test_displays_talks_list_with_seed_data(page: Page):
    page.goto("./")
    expect(page.locator("h1")).to_contain_text("TalkVote")
    cards = page.locator("article")
    expect(cards).to_have_count(8)


def test_shows_title_speaker_and_vote_count_on_each_card(page: Page):
    page.goto("./")
    first_card = page.locator("article").first
    expect(first_card.locator("h2")).not_to_be_empty()
    expect(first_card).to_contain_text("by")
    expect(first_card).to_contain_text("👍")


def test_navigate_to_submit_page_via_button(page: Page):
    page.goto("./")
    page.click("text=Submit a talk")
    expect(page).to_have_url(re.compile(r"/submit"))
