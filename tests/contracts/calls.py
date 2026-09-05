from datetime import datetime, timezone

from surety.diff import is_valid_uuid, precise_dates_equal_with_delta
from surety.sdk.dates import Pattern
from surety.sdk.fakeable import fake

import api

from surety.api.caller import ApiCaller



class GetTalks(ApiCaller):
    contract = api.GetTalks

    def __init__(self, params=None):
        super().__init__(params=params)

    def verify(self, talks=None):
        super().verify_response(resp_body=api.GetTalksResponse().with_values(
            talks or []
        ))


class SubmitTalk(ApiCaller):
    contract = api.SubmitTalk

    def __init__(self):
        self.req_body = api.SubmitTalkRequest()
        super().__init__(req_body=self.req_body)

    def verify(self, talks=None):
        super().verify_response(
            error_code=201,
            resp_body=api.SubmitTalkResponse().with_values(
                self.req_body.value
            ).with_values({
                api.SubmitTalkResponse.CreatedAt.name: datetime.now(
                    timezone.utc
                ).strftime(
                    Pattern.DATETIME_DELIM_T_WITH_ZONE_PRECISED
                ),
                api.SubmitTalkResponse.Status.name: api.Status.Pending,
            }),
            rules={
                api.SubmitTalkResponse.Id.name: is_valid_uuid,
                api.SubmitTalkResponse.CreatedAt.name:
                    precise_dates_equal_with_delta
            }
        )

class GetTalk(ApiCaller):
    contract = api.GetTalk

    def __init__(self, talk=None):
        self.talk = talk
        super().__init__(
            path_params=api.TalkPathParams().with_values({
                api.TalkPathParams.Id.name: self.talk and self.talk.Id.value,
            })
        )

    def verify(self, error_code=None):
        if error_code:
            resp_body = api.ErrorResponse().with_values({
                api.ErrorResponse.Error.name: 'Talk not found'
            })
        else:
            resp_body = api.GetTalkResponse().with_values(self.talk.value)

        super().verify_response(error_code=error_code, resp_body=resp_body)


class Vote(ApiCaller):
    contract = api.Vote

    def __init__(self, talk=None, voter_id=None):
        self.talk = talk
        super().__init__(
            path_params=api.TalkPathParams().with_values({
                api.TalkPathParams.Id.name: self.talk and self.talk.Id.value,
            }),
            headers={'X-Voter-Id': voter_id or fake.uuid4()}
        )

    def verify(self, error_code=None, error=None):
        if error_code:
            resp_body = api.ErrorResponse().with_values({
                api.ErrorResponse.Error.name: error or 'Talk not found'
            })
        else:
            resp_body = api.VoteResponse().with_values(self.talk.value)

        super().verify_response(error_code=error_code, resp_body=resp_body)


class UpdateStatus(ApiCaller):
    contract = api.UpdateStatus

    def __init__(self, talk=None, status=None):
        self.talk = talk
        self.status = status
        super().__init__(
            path_params=api.TalkPathParams().with_values({
                api.TalkPathParams.Id.name: self.talk and self.talk.Id.value,
            }),
            req_body=api.UpdateStatusRequest().with_values({
                api.UpdateStatusRequest.Status.name: self.status
            })
        )

    def verify(self, error_code=None):
        if error_code:
            resp_body = api.ErrorResponse().with_values({
                api.ErrorResponse.Error.name: 'Talk not found'
            })
        else:
            resp_body = api.GetTalkResponse().with_values(self.talk.value).with_values({
                api.GetTalkResponse.Status.name: self.status
            })

        super().verify_response(error_code=error_code, resp_body=resp_body)

