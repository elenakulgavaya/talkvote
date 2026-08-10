import urllib.parse

from decimal import ROUND_HALF_UP, Decimal

from surety.sdk.fakeable import fake_string_attr
from surety import (
    Array, Bool, DateTime, Enum, Float, Dictionary, Int, Raw, String, Uuid,
)
from surety.api import ApiContract, HttpMethod
from surety.config import Cfg
from surety.sdk import dates
from surety.sdk.fakeable import fake


SERVICE = 'api/'
BASE_URL = Cfg.App.api_url



class Level(Enum):
    Intermediate = 'intermediate'
    Advanced = 'advanced'
    Beginner = 'beginner'


class Track(Enum):
    Frontend = 'frontend'
    Backend = 'backend'
    QA = 'qa'
    DevOps = 'devops'


class Status(Enum):
    Approved = 'approved'
    Rejected = 'rejected'
    Submitted = 'submitted'


class Talk(Dictionary):
    Abstract = String(name='abstract', fake_as=fake.sentences)
    CreatedAt = DateTime(name='createdAt')
    Id = Uuid(name='id')
    Level = Level(name='level')
    SpeakerName = String(name='speakerName')
    Status = Status(name='status')
    Title = String(name='title', fake_as=fake.sentence)
    Track = Track(name='track')
    Votes = Int(name='votes')


class GetTalksResponse(Array):
    def __init__(self):
        self.save_kwargs(locals())
        super().__init__(field=Talk)


class SubmitTalkRequest(Dictionary):
    Abstract = String(name='abstract', fake_as=fake.sentences)
    Level = Level(name='level')
    SpeakerName = String(name='speakerName')
    Title = String(name='title', fake_as=fake.sentence)
    Track = Track(name='track')


class SubmitTalkResponse(Talk):
    pass


class GetTalkResponse(Talk):
    pass


class ErrorResponse(Dictionary):
    Error = String(name='error', fake_as=fake.sentence)


class TalkPathParams(Dictionary):
    Id = Uuid(name='id')


class VoteResponse(Talk):
    pass


class UpdateStatusRequest(Dictionary):
    Status = Status(name='status')


class UpdateStatusResponse(Talk):
    pass


class GetTalks(ApiContract):
    method = HttpMethod.GET
    url = 'talks'
    resp_body = GetTalksResponse


class SubmitTalk(ApiContract):
    method = HttpMethod.POST
    url = 'talks'
    req_body = SubmitTalkRequest
    resp_body = SubmitTalkResponse


class GetTalk(ApiContract):
    method = HttpMethod.GET
    url = 'talks/{id}'
    path_params = TalkPathParams
    resp_body = GetTalkResponse


class Vote(ApiContract):
    method = HttpMethod.POST
    url = 'talks/{id}/vote'
    path_params = TalkPathParams
    resp_body = VoteResponse


class UpdateStatus(ApiContract):
    method = HttpMethod.PATCH
    url = 'talks/{id}/status'
    path_params = TalkPathParams
    req_body = UpdateStatusRequest
    resp_body = UpdateStatusResponse


class Clear(ApiContract):
    method = HttpMethod.POST
    url = 'clear'
