import re

from playwright.sync_api import Page, expect


def test_shows_browser_validation_when_required_fields_are_empty(page: Page):
    page.goto("./#/submit")
    page.click('[data-testid="submit-button"]')
    expect(page).to_have_url(re.compile(r"/submit"))


def test_clears_field_error_when_user_corrects_the_value(page: Page):
    page.goto("./#/submit")

    page.fill('[data-testid="input-title"]', "T")
    page.fill('[data-testid="input-speakerName"]', "S")
    page.fill('[data-testid="input-abstract"]', "Short abstract")
    page.select_option('[data-testid="input-track"]', "qa")
    page.select_option('[data-testid="input-level"]', "beginner")
    page.click('[data-testid="submit-button"]')

    expect(page).to_have_url(re.compile(r"/talks/.+"))
