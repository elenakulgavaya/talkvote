import re
import time

from playwright.sync_api import Page, expect

from api import GetTalks, GetTalksResponse, Talk, UpdateStatus, TalkPathParams, \
    UpdateStatusResponse, SubmitTalk, SubmitTalkResponse, GetTalk, \
    GetTalkResponse


def test_admin_page_shows_submitted_talks(page: Page):
    GetTalks.reply(reset=True, times=2, body=GetTalksResponse().with_values([
        Talk().with_values({
            Talk.Status.name: 'submitted',
        }) for _ in range(3)
    ]))
    page.goto("./#/admin")
    expect(page.locator("h1")).to_contain_text("Admin")
    rows = page.locator('[data-testid^="admin-talk-"]')
    expect(rows).not_to_have_count(0)


def test_approving_a_talk_removes_it_from_admin_queue(page: Page):
    talk = Talk().with_values({Talk.Status.name: 'submitted'})
    GetTalks.reply(reset=True, times=2, body=GetTalksResponse().with_values([
        talk, Talk().with_values({Talk.Status.name: 'submitted'})
    ]))
    page.goto("./#/admin")
    page.wait_for_selector('[data-testid^="admin-talk-"]')

    before_count = page.locator('[data-testid^="admin-talk-"]').count()

    talk.Status = 'approved'
    UpdateStatus.reply(
        path_params=TalkPathParams().with_values({
            TalkPathParams.Id.name: talk.Id.value
        }),
        body=UpdateStatusResponse().with_values(talk.value),
    )

    page.locator('[data-testid^="approve-"]').first.click()

    page.wait_for_timeout(500)
    after_count = page.locator('[data-testid^="admin-talk-"]').count()
    assert after_count == before_count - 1


def test_approved_talk_appears_as_approved_in_the_main_list(page: Page):
    initial_talk = Talk()
    GetTalks.reply(reset=True, times=2, body=GetTalksResponse().with_values([
        initial_talk
    ]))
    page.goto("./#/submit")
    title = f"Admin Approve Test {int(time.time() * 1000)}"
    page.fill('[data-testid="input-title"]', title)
    page.fill('[data-testid="input-speakerName"]', "Admin Tester")
    page.fill('[data-testid="input-abstract"]', "Testing admin approval flow end to end.")
    page.select_option('[data-testid="input-track"]', "devops")
    page.select_option('[data-testid="input-level"]', "intermediate")
    talk = Talk().with_values({
        Talk.Title.name: title,
        Talk.Status.name: 'submitted'
    })
    SubmitTalk.reply(body=SubmitTalkResponse().with_values(talk.value))
    GetTalk.reply(
        path_params=TalkPathParams().with_values({
            TalkPathParams.Id.name: talk.Id.value
        }),
        body=GetTalkResponse().with_values(talk.value),
        times=2
    )
    page.click('[data-testid="submit-button"]')
    page.wait_for_url(re.compile(r"/talks/.+"))

    GetTalks.reply(reset=True, times=2, body=GetTalksResponse().with_values([
        talk
    ]))
    page.goto("./#/admin")
    page.wait_for_selector(f"text={title}")
    talk_row = page.locator('[data-testid^="admin-talk-"]', has_text=title)
    talk.Status = 'approved'
    UpdateStatus.reply(
        path_params=TalkPathParams().with_values({
            TalkPathParams.Id.name: talk.Id.value
        }),
        body=UpdateStatusResponse().with_values(talk.value),
    )
    talk_row.locator('[data-testid^="approve-"]').click()
    page.wait_for_timeout(300)

    expect(page.locator(f"text={title}")).not_to_be_visible()
    GetTalks.reply(reset=True, times=2, body=GetTalksResponse().with_values([
        initial_talk, talk
    ]))
    page.goto("./")
    page.wait_for_selector("article")
    with page.expect_response(lambda r: "/api/talks" in r.url and r.status == 200):
        GetTalks.reply(reset=True, body=GetTalksResponse().with_values([talk]))
        page.select_option('[data-testid="filter-status"]', "approved")
    expect(page.locator(f"text={title}")).to_be_visible()
