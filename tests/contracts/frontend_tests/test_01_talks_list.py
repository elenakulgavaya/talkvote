import random
import re

import pytest

import api

from playwright.sync_api import Browser, Page, expect


@pytest.fixture(scope="module")
def page(browser: Browser, base_url: str):
    context = browser.new_context(base_url=base_url)
    page = context.new_page()
    yield page
    context.close()


@pytest.fixture(scope="module")
def load_talks(page: Page):
    talks = [api.Talk() for _ in range(random.randint(5, 10))]
    api.GetTalks.reply(
        reset=True, times=2, body=api.GetTalksResponse().with_values(talks)
    )
    page.goto("./")
    page.wait_for_selector("article")

    return talks


def test_talks_list_with_seed_data(page:Page, load_talks):
    expect(page.locator("h1")).to_contain_text("TalkVote")
    page.wait_for_selector("article")
    cards = page.locator("article")
    assert cards.count() == len(load_talks)


def test_title_speaker_and_vote_count_on_each_card(page: Page, load_talks):
    first_card = page.locator("article").first
    expect(first_card.locator("h2")).not_to_be_empty()
    expect(first_card).to_contain_text("by")
    expect(first_card).to_contain_text("👍")


def test_navigate_to_submit_page_via_button(page: Page, load_talks):
    page.click("text=Submit a talk")
    expect(page).to_have_url(re.compile(r"/submit"))


def test_get_talks_default_sorting(load_talks):
    api.GetTalks.verify_called(
        params={'sort': ['votes']},
        latest=True
    )
