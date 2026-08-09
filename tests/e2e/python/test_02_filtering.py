from playwright.sync_api import Page, expect


def test_filters_by_track_and_shows_only_matching_talks(page: Page):
    page.goto("./")
    page.wait_for_selector("article")
    total_count = page.locator("article").count()

    with page.expect_response(lambda r: "/api/talks" in r.url and r.status == 200):
        page.select_option('[data-testid="filter-track"]', "qa")

    filtered_count = page.locator("article").count()
    assert filtered_count > 0
    assert filtered_count < total_count

    cards = page.locator("article")
    for i in range(cards.count()):
        expect(cards.nth(i)).to_contain_text("qa")


def test_filters_by_level(page: Page):
    page.goto("./")
    page.wait_for_selector("article")

    with page.expect_response(lambda r: "/api/talks" in r.url and r.status == 200):
        page.select_option('[data-testid="filter-level"]', "beginner")

    cards = page.locator("article")
    assert cards.count() > 0
    for i in range(cards.count()):
        expect(cards.nth(i)).to_contain_text("beginner")


def test_filters_by_status(page: Page):
    page.goto("./")
    page.wait_for_selector("article")

    with page.expect_response(lambda r: "/api/talks" in r.url and r.status == 200):
        page.select_option('[data-testid="filter-status"]', "approved")

    cards = page.locator("article")
    assert cards.count() > 0
    for i in range(cards.count()):
        expect(cards.nth(i)).to_contain_text("approved")


def test_shows_no_results_message_when_filters_match_nothing(page: Page):
    page.goto("./")
    page.wait_for_selector("article")

    with page.expect_response(lambda r: "/api/talks" in r.url and r.status == 200):
        page.select_option('[data-testid="filter-track"]', "devops")
    with page.expect_response(lambda r: "/api/talks" in r.url and r.status == 200):
        page.select_option('[data-testid="filter-level"]', "beginner")

    expect(page.locator("text=No talks found")).to_be_visible()
