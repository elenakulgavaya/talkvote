import pytest

import api

from surety.sdk.fakeable import fake

from calls import Vote


@pytest.fixture(scope="function")
def talk():
    result = api.SubmitTalk().call()
    result.raise_for_status()
    return api.Talk().with_values(result.json())


def test_vote_for_talk_that_not_exits():
    Vote().request().verify(error_code=404)


def test_vote(talk):
    Vote(talk).request().verify()


def test_vote_twice_forbidden(talk):
    voter_id = fake.uuid4()
    Vote(talk, voter_id=voter_id).request().verify()
    Vote(talk, voter_id=voter_id).request().verify(
        error_code=409, error='Already voted for this talk'
    )
