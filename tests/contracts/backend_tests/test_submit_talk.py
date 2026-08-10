from calls import SubmitTalk


def test_submit_talk():
    SubmitTalk().request().verify()
