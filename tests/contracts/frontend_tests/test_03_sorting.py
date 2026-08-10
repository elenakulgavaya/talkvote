from playwright.sync_api import Page

from api import GetTalks, GetTalksResponse, Talk

# this sorting is default
def test_sorted_by_votes_shows_highest_voted_talk_first(page: Page):
    GetTalks.reply(reset=True, times=2, body=GetTalksResponse().with_values([
        Talk().with_values({Talk.Votes.name: 10000 - num})
        for num in range(8)
    ]))
    page.goto("./")
    page.wait_for_selector("article")
    page.select_option('[data-testid="sort-select"]', "votes")
    page.wait_for_timeout(300)

    vote_badges = page.locator("article span[style*='font-weight: 700']")
    texts = vote_badges.all_text_contents()
    votes = [int(t) for t in texts if t.strip().isdigit()]

    for i in range(len(votes) - 1):
        assert votes[i] >= votes[i + 1]
