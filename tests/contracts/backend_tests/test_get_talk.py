import pytest

import api

from calls import GetTalk


@pytest.fixture(scope="module")
def talk():
    result = api.SubmitTalk().call()
    result.raise_for_status()
    return api.Talk().with_values(result.json())


def test_get_talk_not_exits():
    GetTalk().request().verify(error_code=404)


def test_get_talk(talk):
    GetTalk(talk).request().verify()
