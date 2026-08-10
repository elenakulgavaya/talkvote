import pytest

import api

from surety.sdk.fakeable import fake

from calls import GetTalks


@pytest.fixture(scope="module", autouse=True)
def clear():
    api.Clear().call().raise_for_status()


@pytest.fixture(scope="module")
def qa_beginner(clear):
    result = api.SubmitTalk().call(
        req_body=api.SubmitTalkRequest().with_values({
            api.SubmitTalkRequest.Track.name: api.Track.QA,
            api.SubmitTalkRequest.Level.name: api.Level.Beginner,
        }).value
    )
    result.raise_for_status()
    return api.Talk().with_values(result.json())


@pytest.fixture(scope="module")
def dev_advanced(clear):
    result = api.SubmitTalk().call(
        req_body=api.SubmitTalkRequest().with_values({
            api.SubmitTalkRequest.Track.name: api.Track.Backend,
            api.SubmitTalkRequest.Level.name: api.Level.Advanced,
        }).value
    )
    result.raise_for_status()
    return api.Talk().with_values(result.json())


@pytest.fixture(scope="module")
def devops_approved(clear):
    result = api.SubmitTalk().call(
        req_body=api.SubmitTalkRequest().with_values({
            api.SubmitTalkRequest.Track.name: api.Track.DevOps,
            api.SubmitTalkRequest.Level.name: api.Level.Intermediate,
        }).value
    )
    result.raise_for_status()
    task_id = api.Talk().with_values(result.json()).Id.value
    result = api.UpdateStatus().call(
        path_params=api.TalkPathParams().with_values({
            api.TalkPathParams.Id.name: task_id
        }),
        req_body=api.UpdateStatusRequest().with_values({
            api.UpdateStatusRequest.Status.name: api.Status.Approved,
        }).value
    )
    result.raise_for_status()

    return api.Talk().with_values(result.json())


@pytest.fixture(scope="module")
def dev_voted(dev_advanced):
    result = api.Vote().call(
        headers={'X-Voter-Id': fake.uuid4()},
        path_params=api.TalkPathParams().with_values({
            api.TalkPathParams.Id.name: dev_advanced.Id.value
        }),
    )
    result.raise_for_status()

    return api.Talk().with_values(result.json())



def test_get_empty_talks():
    GetTalks().request().verify()


def test_get_single_talk(qa_beginner):
    GetTalks().request().verify(talks=[qa_beginner])


def test_get_multiple_talks(qa_beginner, dev_advanced):
    GetTalks().request().verify(talks=[dev_advanced, qa_beginner])


def test_get_talks_filter_by_track(qa_beginner, dev_advanced):
    GetTalks(params={
        'track': api.Track.QA,
    }).request().verify(talks=[qa_beginner])


def test_get_talks_filter_by_level(qa_beginner, dev_advanced):
    GetTalks(params={
        'level': api.Level.Advanced,
    }).request().verify(talks=[dev_advanced])



def test_get_talks_filter_by_status(qa_beginner, dev_advanced, devops_approved):
    GetTalks(params={
        'status': api.Status.Approved,
    }).request().verify(talks=[devops_approved])


def test_get_talks_sort_by_votes(qa_beginner, dev_voted, devops_approved):
    GetTalks(params={'sort': 'votes'}).request().verify(talks=[
        dev_voted,
        qa_beginner,
        devops_approved,
    ])
