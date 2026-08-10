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
def admin_page(page: Page):
    talks = [api.Talk().with_values({
        api.Talk.Status.name: api.Status.Submitted,
    }) for _ in range(random.randint(3, 6))]
    api.GetTalks.reply(
        reset=True, times=2, body=api.GetTalksResponse().with_values(talks)
    )
    page.goto("./#/admin")

    return talks


def test_admin_page_shows_submitted_talks(page: Page, admin_page):
    expect(page.locator("h1")).to_contain_text("Admin")
    rows = page.locator('[data-testid^="admin-talk-"]')
    expect(rows).to_have_count(len(admin_page))


@pytest.fixture(scope="module")
def approve(page: Page, admin_page):
    admin_page[0].Status = api.Status.Approved
    api.UpdateStatus.reply(
        path_params=api.TalkPathParams().with_values({
            api.TalkPathParams.Id.name: admin_page[0].Id.value
        }),
        body=api.UpdateStatusResponse().with_values(admin_page[0].value),
    )

    page.locator('[data-testid^="approve-"]').first.click()


def test_approving_removes_from_admin_queue(page: Page, approve, admin_page):
    page.wait_for_timeout(500)
    after_count = page.locator('[data-testid^="admin-talk-"]').count()
    assert after_count == len(admin_page) - 1


def test_update_status_request(admin_page, approve):
    api.UpdateStatus.verify_called(
        path_params=api.TalkPathParams().with_values({
            api.TalkPathParams.Id.name: admin_page[0].Id.value
        }),
        expected=api.UpdateStatusRequest().with_values({
            api.UpdateStatusRequest.Status.name: api.Status.Approved,
        }),
    )
