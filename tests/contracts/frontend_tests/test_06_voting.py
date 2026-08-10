import re

import pytest
from playwright.sync_api import Page, expect, Browser

from api import GetTalks, GetTalksResponse, Talk, GetTalk, TalkPathParams, \
    GetTalkResponse, Vote, VoteResponse


def test_vote_button_increments_vote_count(page: Page):
    talk = Talk()
    GetTalks.reply(reset=True, times=2, body=GetTalksResponse().with_values([
        talk
    ]))
    GetTalk.reply(
        path_params=TalkPathParams().with_values({
            TalkPathParams.Id.name: talk.Id.value
        }),
        body=GetTalkResponse().with_values(talk.value),
        times=2
    )
    page.goto("./")
    page.wait_for_selector("article")
    page.locator("article").first.locator("a[href*='/talks/']").last.click()
    page.wait_for_url(re.compile(r"/talks/.+"))

    count_el = page.locator('[data-testid="vote-count"]')
    before = int(count_el.text_content() or "0")
    talk.Votes = talk.Votes.value + 1
    Vote.reply(
        path_params=TalkPathParams().with_values({
            TalkPathParams.Id.name: talk.Id.value
        }),
        body=VoteResponse().with_values(talk.value),
        times=2
    )
    page.click('[data-testid="vote-button"]')

    expect(page.locator('[data-testid="vote-button"]')).to_contain_text("Already voted")
    after = int(count_el.text_content() or "0")
    assert after == before + 1


def test_vote_button_is_disabled_after_voting(page: Page):
    # replace with LocalStorage
    talk = Talk()
    GetTalks.reply(reset=True, times=2, body=GetTalksResponse().with_values([
        talk
    ]))
    GetTalk.reply(
        path_params=TalkPathParams().with_values({
            TalkPathParams.Id.name: talk.Id.value
        }),
        body=GetTalkResponse().with_values(talk.value),
        times=2
    )
    page.goto("./")
    page.wait_for_selector("article")
    page.locator("article").first.locator("a[href*='/talks/']").last.click()
    page.wait_for_url(re.compile(r"/talks/.+"))

    talk.Votes = talk.Votes.value + 1
    Vote.reply(
        path_params=TalkPathParams().with_values({
            TalkPathParams.Id.name: talk.Id.value
        }),
        body=VoteResponse().with_values(talk.value),
        times=2
    )
    page.click('[data-testid="vote-button"]')
    expect(page.locator('[data-testid="vote-button"]')).to_be_disabled()


def test_reload_page_still_shows_already_voted_state(page: Page):
    talk = Talk()
    GetTalks.reply(reset=True, times=2, body=GetTalksResponse().with_values([
        talk
    ]))
    GetTalk.reply(
        path_params=TalkPathParams().with_values({
            TalkPathParams.Id.name: talk.Id.value
        }),
        body=GetTalkResponse().with_values(talk.value),
        times=2
    )
    page.goto("./")
    page.wait_for_selector("article")
    page.locator("article").first.locator("a[href*='/talks/']").last.click()
    page.wait_for_url(re.compile(r"/talks/.+"))
    url = page.url

    talk.Votes = talk.Votes.value + 1
    Vote.reply(
        path_params=TalkPathParams().with_values({
            TalkPathParams.Id.name: talk.Id.value
        }),
        body=VoteResponse().with_values(talk.value),
        times=2
    )
    page.click('[data-testid="vote-button"]')
    expect(page.locator('[data-testid="vote-button"]')).to_contain_text("Already voted")

    GetTalk.reply(
        path_params=TalkPathParams().with_values({
            TalkPathParams.Id.name: talk.Id.value
        }),
        body=GetTalkResponse().with_values(talk.value),
        times=2
    )
    page.goto(url)
    expect(page.locator('[data-testid="vote-button"]')).to_contain_text("Already voted")
