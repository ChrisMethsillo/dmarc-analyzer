from typing import Optional, List
from pydantic import  EmailStr, Field, BaseModel

from uuid import UUID
from beanie import Document, Indexed
from datetime import datetime

class SPF(BaseModel):
    domain: str
    scope: Optional[str]
    result: str

class DKIM(BaseModel):
    domain: str
    selector: Optional[str]
    result: str

class AuthResult(BaseModel):
    spf : Optional[SPF] = None
    dkim: Optional[DKIM] = None

class PolicyEvaluated(BaseModel):
    disposition: str
    dkim: str
    spf: str

class Row(BaseModel):
    source_ip: str
    count: int
    policy_evaluated: PolicyEvaluated

class Identifiers(BaseModel):
    envelope_to: str
    envelope_from: str
    header_from: str

class Record(BaseModel):
    row: Row
    identifiers: Identifiers
    auth_results: Optional[AuthResult] = None

class PolicyPublished(BaseModel):
    domain: str
    adkim: str
    aspf: str
    p: str
    sp: str
    pct: int
    fo: int

class DMARCReportModel(Document):
    version: str
    org_name: str 
    report_id: UUID
    email: EmailStr
    date_begin: datetime
    date_end: datetime
    policy_published: PolicyPublished
    record: List[Record]

    class Settings:
        name = "dmarc_report"

    