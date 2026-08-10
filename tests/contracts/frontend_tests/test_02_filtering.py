import random

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


def test_filter_by_track(page: Page, load_talks: list[api.Talk]):
    with page.expect_response(lambda r: "/api/talks" in r.url and r.status == 200):
        api.GetTalks.reply(reset=True, body=api.GetTalksResponse().with_values([
            api.Talk().with_values({api.Talk.Track.name: api.Track.QA})
        ]), params={api.Talk.Track.name: api.Track.QA})
        page.select_option('[data-testid="filter-track"]', "qa")

    filtered_count = page.locator("article").count()
    assert filtered_count == 1

    cards = page.locator("article")
    for i in range(cards.count()):
        expect(cards.nth(i)).to_contain_text("qa")

    api.GetTalks.verify_called(
        params={'sort': ['votes'], 'track': ['qa']},
        latest=True
    )


def test_filters_by_level(page: Page, load_talks: list[api.Talk]):
    with page.expect_response(lambda r: "/api/talks" in r.url and r.status == 200):
        api.GetTalks.reply(body=api.GetTalksResponse().with_values([
            api.Talk().with_values({api.Talk.Level.name: api.Level.Beginner})
            for _ in range(3)
        ]), params={api.Talk.Level.name: api.Level.Beginner}, reset=True)
        page.select_option('[data-testid="filter-level"]', "beginner")

    cards = page.locator("article")
    assert cards.count() == 3
    for i in range(cards.count()):
        expect(cards.nth(i)).to_contain_text("beginner")

    api.GetTalks.verify_called(
        params={'sort': ['votes'], 'level': ['beginner'], 'track': ['qa']},
        latest=True
    )


def test_filters_by_status(page: Page, load_talks: list[api.Talk]):
    with page.expect_response(lambda r: "/api/talks" in r.url and r.status == 200):
        api.GetTalks.reply(body=api.GetTalksResponse().with_values([
            api.Talk().with_values({api.Talk.Status.name: api.Status.Approved})
            for _ in range(5)
        ]), params={api.Talk.Status.name: api.Status.Approved}, reset=True)
        page.select_option('[data-testid="filter-status"]', "approved")

    cards = page.locator("article")
    assert cards.count() == 5
    for i in range(cards.count()):
        expect(cards.nth(i)).to_contain_text("approved")

    api.GetTalks.verify_called(
        params={
            'sort': ['votes'],
            'level': ['beginner'],
            'track': ['qa'],
            'status': ['approved'],
        },
        latest=True
    )


def test_no_results_message(page: Page, load_talks: list[api.Talk]):
    with page.expect_response(lambda r: "/api/talks" in r.url and r.status == 200):
        api.GetTalks.reply(
            body=api.GetTalksResponse().with_values([]),
            params={api.Talk.Track.name: api.Track.DevOps},
            reset=True
        )
        page.select_option('[data-testid="filter-track"]', "devops")

    expect(page.locator("text=No talks found")).to_be_visible()

    api.GetTalks.verify_called(
        params={
            'sort': ['votes'],
            'level': ['beginner'],
            'track': ['devops'],
            'status': ['approved'],
        },
        latest=True
    )
