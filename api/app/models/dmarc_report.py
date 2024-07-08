from typing import Optional, List, Union
from pydantic import EmailStr, Field, BaseModel, validator
from uuid import UUID
from beanie import Document, Indexed
from datetime import datetime

class DateRangeType(BaseModel):
    begin: datetime
    end: datetime

class ReportMetadataType(BaseModel):
    org_name: str
    email: EmailStr
    extra_contact_info: Optional[str] = None
    report_id: str
    date_range: DateRangeType
    error: Optional[List[str]] = None


class PolicyOverrideReason(BaseModel):
    type: str
    comment: Optional[str] = None

class PolicyEvaluatedType(BaseModel):
    disposition: str
    dkim: str
    spf: str
    reason: Optional[Union[PolicyOverrideReason, List[PolicyOverrideReason]]] = None

    @validator('reason', pre=True)
    def ensure_reason_is_list(cls, v):
        if v is None:
            return v
        if isinstance(v, list):
            return v
        return [v]


class RowType(BaseModel):
    source_ip: str
    count: int
    policy_evaluated: PolicyEvaluatedType

class IdentifierType(BaseModel):
    envelope_to: Optional[str] = None
    envelope_from: Optional[str] = None
    header_from: Optional[str] = None


class DKIMAuthResultType(BaseModel):
    domain: str
    selector: Optional[str] = None
    result: str
    human_result: Optional[str] = None


class SPFAuthResultType(BaseModel):
    domain: str
    scope: Optional[str] = None
    result: str

class AuthResultType(BaseModel):   
    dkim: Optional[Union[DKIMAuthResultType, List[DKIMAuthResultType]]] = None
    spf: Optional[Union[SPFAuthResultType, List[SPFAuthResultType]]] = None
    
    @validator('dkim', pre=True)
    def ensure_reason_is_list(cls, v):
        if v is None:
            return v
        if isinstance(v, list):
            return v
        return [v]
    
    @validator('spf', pre=True)
    def ensure_reason_is_list(cls, v):
        if v is None:
            return v
        if isinstance(v, list):
            return v
        return [v]

class RecordType(BaseModel):
    row: RowType
    identifiers: IdentifierType
    auth_results: AuthResultType

class PolicyPublishedType(BaseModel):
    domain: str
    adkim: Optional[str] = None
    aspf: Optional[str] = None
    p: Optional[str] = None
    sp: Optional[str] = None
    pct: Optional[int] = None
    fo: Optional[str] = None

class DMARCReportModel(Document):
    version: Optional[str] = None
    report_metadata: ReportMetadataType
    policy_published: PolicyPublishedType
    record: Union[List[RecordType], RecordType]
    
    @validator('record', pre=True)
    def ensure_record_is_list(cls, v):
        if isinstance(v, list):
            return v
        return [v]
    
    class Settings:
        collection = "dmarc_report"
