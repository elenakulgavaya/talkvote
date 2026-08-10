import re

import pytest

import api

from playwright.sync_api import Browser, Page, expect
from surety.diff.rules import is_valid_uuid
from surety.sdk.fakeable import fake


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

@pytest.fixture(scope="module")
def vote(page: Page, load_talk):
    load_talk.Votes = load_talk.Votes.value + 1
    api.Vote.reply(
        path_params=api.TalkPathParams().with_values({
            api.TalkPathParams.Id.name: load_talk.Id.value
        }),
        body=api.VoteResponse().with_values(load_talk.value),
        times=2
    )
    page.click('[data-testid="vote-button"]')


def test_vote_button_increments_vote_count(page: Page, load_talk, vote):
    expect(page.locator('[data-testid="vote-button"]')).to_contain_text("Already voted")
    after = int(page.locator('[data-testid="vote-count"]').text_content() or "0")
    assert after == load_talk.Votes.value

def test_vote_request(load_talk, vote):
    api.Vote.verify_called(
        path_params=api.TalkPathParams().with_values({
            api.TalkPathParams.Id.name: load_talk.Id.value
        }),
        headers={'X-Voter-Id': [fake.uuid4()]},
        header_rules={'X-Voter-Id': [is_valid_uuid]},
    )


def test_vote_button_is_disabled_after_voting(page: Page, vote):
    # replace check with LocalStorage
    expect(page.locator('[data-testid="vote-button"]')).to_be_disabled()


def test_reload_page_still_shows_already_voted_state(page: Page, load_talk, vote):
    url = page.url
    api.GetTalk.reply(
        path_params=api.TalkPathParams().with_values({
            api.TalkPathParams.Id.name: load_talk.Id.value
        }),
        body=api.GetTalkResponse().with_values(load_talk.value),
        times=2
    )
    page.goto(url)
    expect(page.locator('[data-testid="vote-button"]')).to_contain_text("Already voted")
