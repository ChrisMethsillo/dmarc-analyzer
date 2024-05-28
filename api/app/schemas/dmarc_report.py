import graphene
from graphene import ObjectType, String, List, Field, Int, UUID, DateTime, InputObjectType
import pymongo
from models.dmarc_report import DMARCReportModel
from utils.models_parser import *

class PolicyEvaluatedInput(InputObjectType):
    disposition = graphene.String()
    dkim = graphene.String()
    spf = graphene.String()

class RowInput(InputObjectType):
    source_ip = graphene.String()
    count = graphene.Int()
    policy_evaluated = Field(PolicyEvaluatedInput)

class IdentifiersInput(InputObjectType):
    envelope_to = graphene.String()
    envelope_from = graphene.String()
    header_from = graphene.String()

class AuthResultInput(InputObjectType):
    spf = graphene.Field(lambda: SPFInput)
    dkim = graphene.Field(lambda: DKIMInput)

class SPFInput(InputObjectType):
    domain = graphene.String()
    scope = graphene.String()
    result = graphene.String()

class DKIMInput(InputObjectType):
    domain = graphene.String()
    selector = graphene.String()
    result = graphene.String()

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
    fo = graphene.Int()

class DMARCReportInput(InputObjectType):
    version = graphene.String()
    org_name = graphene.String()
    report_id = graphene.UUID()
    email = graphene.String()
    date_begin = graphene.DateTime()
    date_end = graphene.DateTime()
    policy_published = Field(PolicyPublishedInput)
    record = List(RecordInput)

class PolicyEvaluatedType(graphene.ObjectType):
    disposition = graphene.String()
    dkim = graphene.String()
    spf = graphene.String()

class RowType(graphene.ObjectType):
    source_ip = graphene.String()
    count = graphene.Int()
    policy_evaluated = Field(PolicyEvaluatedType)

class IdentifiersType(graphene.ObjectType):
    envelope_to = graphene.String()
    envelope_from = graphene.String()
    header_from = graphene.String()

class AuthResultType(graphene.ObjectType):
    spf = graphene.Field(lambda: SPFType)
    dkim = graphene.Field(lambda: DKIMType)

class SPFType(graphene.ObjectType):
    domain = graphene.String()
    scope = graphene.String()
    result = graphene.String()

class DKIMType(graphene.ObjectType):
    domain = graphene.String()
    selector = graphene.String()
    result = graphene.String()

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
    fo = graphene.Int()

class DMARCReportType(graphene.ObjectType):
    id = graphene.UUID()
    version = graphene.String()
    org_name = graphene.String()
    report_id = graphene.UUID()
    email = graphene.String()
    date_begin = graphene.DateTime()
    date_end = graphene.DateTime()
    policy_published = Field(PolicyPublishedType)
    record = List(RecordType)

class Query(ObjectType):
    all_dmarc_reports = List(DMARCReportType, skip=Int(), limit=Int())
    dmarc_report_by_id = Field(DMARCReportType, report_id=UUID(required=True))
    all_dmarc_reports_by_date_range = List(DMARCReportType, start_date=DateTime(required=True), end_date=DateTime(required=True))
    
    async def resolve_all_dmarc_reports(root, info, skip=0, limit=10):
        reports = await DMARCReportModel.find_all().skip(skip).limit(limit).to_list()
        return reports
    
    async def resolve_all_dmarc_reports_by_date_range(root, info, start_date, end_date):
        print(start_date, end_date)
        reports = await DMARCReportModel.find_many(
            DMARCReportModel.date_begin >= start_date,
            DMARCReportModel.date_end <= end_date
        ).sort(
            [
                (DMARCReportModel.date_begin, pymongo.ASCENDING),
                (DMARCReportModel.date_end, pymongo.ASCENDING),
            ]
        ).to_list()
        print(reports)
        if not reports:
            raise Exception("No DMARC Reports found for the given date range")
        return reports
    
    async def resolve_dmarc_report_by_id(root, info, report_id):
        report = await DMARCReportModel.find_one({"report_id": report_id})
        if not report:
            raise Exception("DMARC Report not found")
        return report

class CreateDMARCReport(graphene.Mutation):
    class Arguments:
        #receive a dictionary with the report data, not a DMARCReportModel instance
        report = DMARCReportInput(required=True)

    message = graphene.String()

    async def mutate(root, info, report):
        new_report = DMARCReportModel(**report)
        await new_report.create()
        return CreateDMARCReport(message="DMARC Report created successfully")

class Mutation(graphene.ObjectType):
    create_dmarc_report = CreateDMARCReport.Field()

schema = graphene.Schema(query=Query, mutation=Mutation, auto_camelcase=False)
