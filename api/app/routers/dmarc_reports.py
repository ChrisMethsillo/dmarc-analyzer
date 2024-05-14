
from typing import Annotated
from fastapi import APIRouter, Depends, Query, status, HTTPException
from fastapi.encoders import jsonable_encoder
import pymongo
from utils.models_parser import parse_metadata
from models.dmarc_report import *
from uuid import UUID, uuid4

router = APIRouter()


@router.post("/aggregated_report", status_code=status.HTTP_201_CREATED)
#make a way to receive a json to create a new DMARC report
async def create_dmarc_report(report: dict):
    report = parse_metadata(report)
    new_report = DMARCReportModel(**report)
    await new_report.create()
    return {"message": "DMARC Report created successfully"}
    

async def get_all_dmarc_reports(skip: int = 0, limit: int = 10):
    reports = await DMARCReportModel.find_all().skip(skip).limit(limit).to_list()
    return reports

async def get_dmarc_reports_by_date_range(start_date: datetime, end_date: datetime):
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
    if not reports:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No DMARC Reports found for the given date range")
    return reports

@router.get("/aggregated_report", response_model=List[DMARCReportModel])
async def get_dmarc_reports(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 10,
):
    if start_date and end_date:
        return await get_dmarc_reports_by_date_range(start_date, end_date)
    else:
        return await get_all_dmarc_reports(skip, limit)


@router.get("/aggregated_report/{report_id}", response_model=DMARCReportModel)
async def get_dmarc_report_by_id(report_id: UUID):
    report = await DMARCReportModel.find_one({"report_id": report_id})
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DMARC Report not found")
    return report
  
@router.put("/aggregated_report/{report_id}", status_code=status.HTTP_200_OK)
async def update_dmarc_report(report_id: UUID, updated_data: DMARCReportModel):
    # Update logic (consider limitations, e.g., immutability of report data)
    existing_report = await DMARCReportModel.get(report_id)
    if not existing_report:
        raise HTTPException(status_code=status.HTTP_404_)