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
def talk():
    return api.Talk().with_values({
        api.Talk.Status.name: api.Status.Pending
    })

@pytest.fixture(scope="module")
def submit(page: Page, talk):
    page.goto("./#/submit")
    expect(page.locator("h1")).to_contain_text("Submit a Talk")

    page.fill('[data-testid="input-title"]', talk.Title.value)
    page.fill('[data-testid="input-speakerName"]', talk.SpeakerName.value)
    page.fill('[data-testid="input-abstract"]', talk.Abstract.value)
    page.select_option('[data-testid="input-track"]', talk.Track.value)
    page.select_option('[data-testid="input-level"]', talk.Level.value)

    api.SubmitTalk.reply(
        reset=True, body=api.SubmitTalkResponse().with_values(talk.value)
    )
    api.GetTalk.reply(
        path_params=api.TalkPathParams().with_values({
            api.TalkPathParams.Id.name: talk.Id.value
        }),
        body=api.GetTalkResponse().with_values(talk.value),
        times=2
    )

    page.click('[data-testid="submit-button"]')


def test_submit_redirects_to_details(page: Page, talk, submit):
    expect(page).to_have_url(re.compile(r"/talks/.+"))
    expect(page.locator("h1")).to_contain_text(talk.Title.value)


def test_submit_request(page: Page, talk, submit):
    api.SubmitTalk.verify_called(
        expected=api.SubmitTalkRequest().with_values({
            api.SubmitTalkRequest.Title.name: talk.Title.value,
            api.SubmitTalkRequest.Abstract.name: talk.Abstract.value,
            api.SubmitTalkRequest.SpeakerName.name: talk.SpeakerName.value,
            api.SubmitTalkRequest.Track.name: talk.Track.value,
            api.SubmitTalkRequest.Level.name: talk.Level.value,
        })
    )

def test_get_talk_request(page: Page, talk, submit):
    api.GetTalk.verify_called(
        path_params=api.TalkPathParams().with_values({
            api.TalkPathParams.Id.name: talk.Id.value
        }),
        latest=True
    )


def test_list_refreshed_on_going_back(page: Page, talk, submit):
    api.GetTalks.reply(
        times=2, body=api.GetTalksResponse().with_values([talk.value])
    )
    page.goto("./")
    page.wait_for_selector("article")
    expect(page.locator(f"text={talk.Title.value}")).to_be_visible()

    api.GetTalks.verify_called(latest=True)
