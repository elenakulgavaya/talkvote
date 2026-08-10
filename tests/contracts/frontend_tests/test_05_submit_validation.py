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
def submit_empty(page: Page):
    page.goto("./#/submit")
    page.click('[data-testid="submit-button"]')



def test_do_not_submit_empty_fields(page: Page, submit_empty):
    page.goto("./#/submit")
    page.click('[data-testid="submit-button"]')
    expect(page).to_have_url(re.compile(r"/submit"))


def test_clears_field_error_when_user_corrects_the_value(page: Page, submit_empty):
    page.fill('[data-testid="input-title"]', "T")
    page.fill('[data-testid="input-speakerName"]', "S")
    page.fill('[data-testid="input-abstract"]', "Short abstract")
    page.select_option('[data-testid="input-track"]', "qa")
    page.select_option('[data-testid="input-level"]', "beginner")

    talk = api.Talk().with_values({api.Talk.Title.name: 'T'})
    api.SubmitTalk.reply(body=api.SubmitTalkResponse().with_values(talk.value))
    api.GetTalk.reply(
        path_params=api.TalkPathParams().with_values({
            api.TalkPathParams.Id.name: talk.Id.value
        }),
        body=api.GetTalkResponse().with_values(talk.value),
        times=2
    )
    page.click('[data-testid="submit-button"]')

    expect(page).to_have_url(re.compile(r"/talks/.+"))
