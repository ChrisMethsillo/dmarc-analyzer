from fastapi import APIRouter

from strawberry.schema.config import StrawberryConfig

import strawberry
from datetime import datetime
from typing import List, Optional
import pymongo
from models.dmarc_report import DMARCReportModel

router = APIRouter()

# Input Types
@strawberry.input
class PolicyOverrideReasonInput:
    type: Optional[str]
    comment: Optional[str]

@strawberry.input
class PolicyEvaluatedInput:
    disposition: Optional[str]
    dkim: Optional[str]
    spf: Optional[str]
    reason: Optional[List[PolicyOverrideReasonInput]]

@strawberry.input
class RowInput:
    source_ip: Optional[str]
    count: Optional[int]
    policy_evaluated: Optional[PolicyEvaluatedInput]

@strawberry.input
class IdentifiersInput:
    envelope_to: Optional[str]
    envelope_from: Optional[str]
    header_from: Optional[str]

@strawberry.input
class DKIMInput:
    domain: Optional[str]
    selector: Optional[str]
    result: Optional[str]
    human_result: Optional[str]

@strawberry.input
class SPFInput:
    domain: Optional[str]
    scope: Optional[str]
    result: Optional[str]

@strawberry.input
class AuthResultInput:
    dkim: Optional[DKIMInput]
    spf: Optional[SPFInput]

@strawberry.input
class RecordInput:
    row: Optional[RowInput]
    identifiers: Optional[IdentifiersInput]
    auth_results: Optional[AuthResultInput]

@strawberry.input
class PolicyPublishedInput:
    domain: Optional[str]
    adkim: Optional[str]
    aspf: Optional[str]
    p: Optional[str]
    sp: Optional[str]
    pct: Optional[int]
    fo: Optional[str]

@strawberry.input
class DateRangeInput:
    begin: Optional[datetime]
    end: Optional[datetime]

@strawberry.input
class ReportMetadataInput:
    org_name: Optional[str]
    email: Optional[str]
    extra_contact_info: Optional[str]
    report_id: Optional[str]
    date_range: Optional[DateRangeInput]
    error: Optional[List[str]]

@strawberry.input
class DMARCReportInput:
    version: Optional[str]
    report_metadata: Optional[ReportMetadataInput]
    policy_published: Optional[PolicyPublishedInput]
    record: Optional[List[RecordInput]]

# Output Types
@strawberry.type
class PolicyOverrideReasonType:
    type: Optional[str]
    comment: Optional[str]

@strawberry.type
class PolicyEvaluatedType:
    disposition: Optional[str]
    dkim: Optional[str]
    spf: Optional[str]
    reason: Optional[List[PolicyOverrideReasonType]]

@strawberry.type
class RowType:
    source_ip: Optional[str]
    count: Optional[int]
    policy_evaluated: Optional[PolicyEvaluatedType]

@strawberry.type
class IdentifiersType:
    envelope_to: Optional[str]
    envelope_from: Optional[str]
    header_from: Optional[str]

@strawberry.type
class DKIMType:
    domain: Optional[str]
    selector: Optional[str]
    result: Optional[str]
    human_result: Optional[str]

@strawberry.type
class SPFType:
    domain: Optional[str]
    scope: Optional[str]
    result: Optional[str]

@strawberry.type
class AuthResultType:
    dkim: Optional[DKIMType]
    spf: Optional[SPFType]

@strawberry.type
class RecordType:
    row: Optional[RowType]
    identifiers: Optional[IdentifiersType]
    auth_results: Optional[AuthResultType]

@strawberry.type
class PolicyPublishedType:
    domain: Optional[str]
    adkim: Optional[str]
    aspf: Optional[str]
    p: Optional[str]
    sp: Optional[str]
    pct: Optional[int]
    fo: Optional[str]

@strawberry.type
class DateRangeType:
    begin: Optional[datetime]
    end: Optional[datetime]

@strawberry.type
class ReportMetadataType:
    org_name: Optional[str]
    email: Optional[str]
    extra_contact_info: Optional[str]
    report_id: Optional[str]
    date_range: Optional[DateRangeType]
    error: Optional[List[str]]

@strawberry.type
class DMARCReportType:
    id: Optional[str]
    version: Optional[str]
    report_metadata: Optional[ReportMetadataType]
    policy_published: Optional[PolicyPublishedType]
    record: Optional[List[RecordType]]

# Queries
@strawberry.type
class Query:
    @strawberry.field
    async def all_dmarc_reports(self, skip: int = 0, limit: int = 10) -> List[DMARCReportType]:
        try:
            reports = await DMARCReportModel.find_all().skip(skip).limit(limit).to_list()
            return reports
        except Exception as e:
            raise Exception(f"Error retrieving DMARC reports: {str(e)}")

    @strawberry.field
    async def dmarc_report_by_id(self, report_id: str) -> Optional[DMARCReportType]:
        try:
            report = await DMARCReportModel.find_one({"report_metadata.report_id": report_id})
            if not report:
                raise Exception("DMARC Report not found")
            return report
        except Exception as e:
            raise Exception(f"Error retrieving DMARC report by ID: {str(e)}")

    @strawberry.field
    async def all_dmarc_reports_by_date_range(self, start_date: datetime, end_date: datetime) -> List[DMARCReportType]:
        try:
            reports = await DMARCReportModel.find_many(
                DMARCReportModel.report_metadata.date_range.begin >= start_date,
                DMARCReportModel.report_metadata.date_range.end <= end_date
            ).sort(
                [
                    (DMARCReportModel.report_metadata.date_range.begin, pymongo.ASCENDING),
                    (DMARCReportModel.report_metadata.date_range.end, pymongo.ASCENDING),
                ]
            ).to_list()
            if not reports:
                raise Exception("No DMARC Reports found for the given date range")
            return reports
        except Exception as e:
            raise Exception(f"Error retrieving DMARC reports by date range: {str(e)}")

# Mutations
@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_dmarc_report(self, report: DMARCReportInput) -> str:
        try:
            new_report = DMARCReportModel(**report)
            await new_report.create()
            return "DMARC Report created successfully"
        except Exception as e:
            raise Exception(f"Error creating DMARC report: {str(e)}")

schema = strawberry.Schema(query=Query, mutation=Mutation, config=StrawberryConfig(auto_camel_case=False))