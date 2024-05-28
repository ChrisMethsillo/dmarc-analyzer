import graphene
from graphene import ObjectType, String, List, Field, Int, DateTime, InputObjectType, UUID
import pymongo
from models.dmarc_report import DMARCReportModel
from datetime import datetime
from typing import Optional

# Input Types
class PolicyOverrideReasonInput(InputObjectType):
    type = graphene.String()
    comment = graphene.String()

class PolicyEvaluatedInput(InputObjectType):
    disposition = graphene.String()
    dkim = graphene.String()
    spf = graphene.String()
    reason = graphene.List(PolicyOverrideReasonInput)

class RowInput(InputObjectType):
    source_ip = graphene.String()
    count = graphene.Int()
    policy_evaluated = Field(PolicyEvaluatedInput)

class IdentifiersInput(InputObjectType):
    envelope_to = graphene.String()
    envelope_from = graphene.String()
    header_from = graphene.String()

class DKIMInput(InputObjectType):
    domain = graphene.String()
    selector = graphene.String()
    result = graphene.String()
    human_result = graphene.String()

class SPFInput(InputObjectType):
    domain = graphene.String()
    scope = graphene.String()
    result = graphene.String()

class AuthResultInput(InputObjectType):
    dkim = graphene.Field(DKIMInput)
    spf = graphene.Field(SPFInput)

class RecordInput(InputObjectType):
    row = Field(RowInput)
    identifiers = Field(IdentifiersInput)
    auth_results = Field(AuthResultInput)

class PolicyPublishedInput(InputObjectType):
    domain = graphene.String()
    adkim = graphene.String()
    aspf = graphene.String()
    p = graphene.String()
    sp = graphene.String()
    pct = graphene.Int()
    fo = graphene.String()

class DateRangeInput(InputObjectType):
    begin = graphene.DateTime()
    end = graphene.DateTime()

class ReportMetadataInput(InputObjectType):
    org_name = graphene.String()
    email = graphene.String()
    extra_contact_info = graphene.String()
    report_id = graphene.String()
    date_range = Field(DateRangeInput)
    error = graphene.List(graphene.String)

class DMARCReportInput(InputObjectType):
    version = graphene.String()
    report_metadata = Field(ReportMetadataInput)
    policy_published = Field(PolicyPublishedInput)
    record = graphene.List(RecordInput)

# Output Types
class PolicyOverrideReasonType(graphene.ObjectType):
    type = graphene.String()
    comment = graphene.String()

class PolicyEvaluatedType(graphene.ObjectType):
    disposition = graphene.String()
    dkim = graphene.String()
    spf = graphene.String()
    reason = graphene.List(PolicyOverrideReasonType)

class RowType(graphene.ObjectType):
    source_ip = graphene.String()
    count = graphene.Int()
    policy_evaluated = Field(PolicyEvaluatedType)

class IdentifiersType(graphene.ObjectType):
    envelope_to = graphene.String()
    envelope_from = graphene.String()
    header_from = graphene.String()

class DKIMType(graphene.ObjectType):
    domain = graphene.String()
    selector = graphene.String()
    result = graphene.String()
    human_result = graphene.String()

class SPFType(graphene.ObjectType):
    domain = graphene.String()
    scope = graphene.String()
    result = graphene.String()

class AuthResultType(graphene.ObjectType):
    dkim = graphene.Field(DKIMType)
    spf = graphene.Field(SPFType)

class RecordType(graphene.ObjectType):
    row = Field(RowType)
    identifiers = Field(IdentifiersType)
    auth_results = Field(AuthResultType)

class PolicyPublishedType(graphene.ObjectType):
    domain = graphene.String()
    adkim = graphene.String()
    aspf = graphene.String()
    p = graphene.String()
    sp = graphene.String()
    pct = graphene.Int()
    fo = graphene.String()

class DateRangeType(graphene.ObjectType):
    begin = graphene.DateTime()
    end = graphene.DateTime()

class ReportMetadataType(graphene.ObjectType):
    org_name = graphene.String()
    email = graphene.String()
    extra_contact_info = graphene.String()
    report_id = graphene.String()
    date_range = Field(DateRangeType)
    error = graphene.List(graphene.String)

class DMARCReportType(graphene.ObjectType):
    id = graphene.UUID()
    version = graphene.String()
    report_metadata = Field(ReportMetadataType)
    policy_published = Field(PolicyPublishedType)
    record = List(RecordType)

# Queries
class Query(ObjectType):
    all_dmarc_reports = List(DMARCReportType, skip=Int(), limit=Int())
    dmarc_report_by_id = Field(DMARCReportType, report_id=UUID(required=True))
    all_dmarc_reports_by_date_range = List(DMARCReportType, start_date=DateTime(required=True), end_date=DateTime(required=True))

    async def resolve_all_dmarc_reports(root, info, skip=0, limit=10):
        try:
            reports = await DMARCReportModel.find_all().skip(skip).limit(limit).to_list()
            return reports
        except Exception as e:
            raise Exception(f"Error retrieving DMARC reports: {str(e)}")

    async def resolve_all_dmarc_reports_by_date_range(root, info, start_date, end_date):
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

    async def resolve_dmarc_report_by_id(root, info, report_id):
        try:
            report = await DMARCReportModel.find_one({"report_metadata.report_id": report_id})
            if not report:
                raise Exception("DMARC Report not found")
            return report
        except Exception as e:
            raise Exception(f"Error retrieving DMARC report by ID: {str(e)}")

# Mutations
class CreateDMARCReport(graphene.Mutation):
    class Arguments:
        report = DMARCReportInput(required=True)

    message = graphene.String()

    async def mutate(root, info, report):
        try:
            new_report = DMARCReportModel(**report)
            await new_report.create()
            return CreateDMARCReport(message="DMARC Report created successfully")
        except Exception as e:
            raise Exception(f"Error creating DMARC report: {str(e)}")

class Mutation(graphene.ObjectType):
    create_dmarc_report = CreateDMARCReport.Field()

schema = graphene.Schema(query=Query, mutation=Mutation, auto_camelcase=False)
