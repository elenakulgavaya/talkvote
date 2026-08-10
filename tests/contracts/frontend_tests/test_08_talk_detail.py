import re

from playwright.sync_api import Page, expect

from api import GetTalks, Talk, GetTalksResponse, GetTalk, TalkPathParams, \
    GetTalkResponse


def test_shows_correct_title_speaker_abstract_and_vote_count(page: Page):
    talk = Talk()
    GetTalks.reply(reset=True, times=2, body=GetTalksResponse().with_values([
        talk
    ]))
    page.goto("./")
    page.wait_for_selector("article")

    first_card = page.locator("article").first
    title_text = first_card.locator("h2").text_content().strip()
    speaker_text = first_card.locator("p").first.text_content().strip()
    GetTalk.reply(
        path_params=TalkPathParams().with_values({
            TalkPathParams.Id.name: talk.Id.value
        }),
        body=GetTalkResponse().with_values(talk.value),
        times=2
    )
    first_card.locator("a[href*='/talks/']").last.click()
    page.wait_for_url(re.compile(r"/talks/.+"))

    expect(page.locator("h1")).to_contain_text(title_text)
    expect(page.locator("p").first).to_contain_text(speaker_text.replace("by ", ""))
    expect(page.locator('[data-testid="vote-count"]')).to_be_visible()


def test_back_link_returns_to_list(page: Page):
    talk = Talk()
    talks = [talk, Talk(), Talk(), Talk()]
    GetTalks.reply(reset=True, times=2, body=GetTalksResponse().with_values(talks))
    page.goto("./")
    page.wait_for_selector("article")

    GetTalk.reply(
        path_params=TalkPathParams().with_values({
            TalkPathParams.Id.name: talk.Id.value
        }),
        body=GetTalkResponse().with_values(talk.value),
        times=2
    )
    page.locator("article").first.locator("a[href*='/talks/']").last.click()
    page.wait_for_url(re.compile(r"/talks/.+"))
    GetTalks.reply(reset=True, times=2,
                   body=GetTalksResponse().with_values(talks))
    page.click("text=← Back to list")
    expect(page).to_have_url(re.compile(r"/$"))
