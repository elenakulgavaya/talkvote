import pytest

import api

from calls import UpdateStatus


@pytest.fixture(scope="function")
def talk():
    result = api.SubmitTalk().call()
    result.raise_for_status()
    return api.Talk().with_values(result.json())


def test_update_status_for_talk_that_not_exits():
    UpdateStatus(status=api.Status.Approved).request().verify(error_code=404)


def test_update_status_approve(talk):
    UpdateStatus(talk, status=api.Status.Approved).request().verify()


def test_update_status_reject(talk):
    UpdateStatus(talk, status=api.Status.Rejected).request().verify()
