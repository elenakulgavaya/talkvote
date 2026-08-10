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
def load_talk(page: Page):
    talk = api.Talk()
    api.GetTalks.reply(
        reset=True, times=2, body=api.GetTalksResponse().with_values([talk])
    )
    api.GetTalk.reply(
        path_params=api.TalkPathParams().with_values({
            api.TalkPathParams.Id.name: talk.Id.value
        }),
        body=api.GetTalkResponse().with_values(talk.value),
        times=2
    )
    page.goto("./")
    page.wait_for_selector("article")
    page.locator("article").first.locator("a[href*='/talks/']").last.click()
    page.wait_for_url(re.compile(r"/talks/.+"))

    return talk


def test_title_speaker_abstract_and_vote_count(page: Page, load_talk):
    expect(page.locator("h1")).to_contain_text(load_talk.Title.value)
    expect(page.locator("p").first).to_contain_text(
        load_talk.SpeakerName.value.replace("by ", "")
    )
    expect(page.locator('[data-testid="vote-count"]')).to_be_visible()


def test_back_link_returns_to_list(page: Page, load_talk):
    page.wait_for_selector("text=← Back to list")
    api.GetTalks.reply(
        reset=True, times=2, body=api.GetTalksResponse().with_values([load_talk])
    )
    page.click("text=← Back to list")
    expect(page).to_have_url(re.compile(r"/$"))
