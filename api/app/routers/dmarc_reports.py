
from typing import Annotated
from fastapi import APIRouter, Depends, Query, status, HTTPException
from fastapi.encoders import jsonable_encoder
import pymongo
from models.dmarc_report import *

router = APIRouter()

@router.post("/aggregated_report", status_code=status.HTTP_201_CREATED)
async def create_dmarc_report(report: dict):
    """
    Create a DMARC report.

    Args:
        report (dict): The DMARC report to be created.

    Returns:
        dict: A dictionary containing a success message.

    Raises:
        HTTPException: If the report_id is missing or if a DMARC report with the same report_id already exists.
    """
    report_id = report.get("report_metadata", {}).get("report_id")
    if not report_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="report_id is required in report_metadata")
    
    existing_report = await DMARCReportModel.find_one({"report_metadata.report_id": report_id})
    if existing_report:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="DMARC Report with this report_id already exists")
    
    new_report = DMARCReportModel(**report)
    await new_report.create()
    return {"message": "DMARC Report created successfully"}
    

async def get_all_dmarc_reports(skip: int = 0, limit: int = 10):
    """
    Retrieve a list of DMARC reports.

    Args:
        skip (int): Number of reports to skip (default is 0).
        limit (int): Maximum number of reports to retrieve (default is 10).

    Returns:
        List[DMARCReportModel]: A list of DMARC reports.

    """
    reports = await DMARCReportModel.find_all().skip(skip).limit(limit).to_list()
    return reports

async def get_dmarc_reports_by_date_range(start_date: datetime, end_date: datetime):
    """
    Retrieves DMARC reports within a specified date range.

    Args:
        start_date (datetime): The start date of the date range.
        end_date (datetime): The end date of the date range.

    Returns:
        List[DMARCReportModel]: A list of DMARC reports within the specified date range.

    Raises:
        HTTPException: If no DMARC reports are found for the given date range.
    """
    print(start_date, end_date)
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No DMARC Reports found for the given date range")
    return reports

@router.get("/aggregated_report", response_model=List[DMARCReportModel])
async def get_dmarc_reports(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 10,
):
    """
    Retrieve DMARC reports based on the specified date range or retrieve all DMARC reports.

    Parameters:
    - start_date (Optional[datetime]): The start date of the date range to filter the reports. Defaults to None.
    - end_date (Optional[datetime]): The end date of the date range to filter the reports. Defaults to None.
    - skip (int): The number of reports to skip. Defaults to 0.
    - limit (int): The maximum number of reports to retrieve. Defaults to 10.

    Returns:
    - List[DMARCReportModel]: A list of DMARC reports matching the specified criteria.
    """
    if start_date and end_date:
        return await get_dmarc_reports_by_date_range(start_date, end_date)
    else:
        return await get_all_dmarc_reports(skip, limit)


@router.get("/aggregated_report/{report_id}", response_model=DMARCReportModel)
async def get_dmarc_report_by_id(report_id: str):
    """
    Retrieve a DMARC report by its ID.

    Parameters:
    - report_id (str): The ID of the DMARC report to retrieve.

    Returns:
    - DMARCReportModel: The retrieved DMARC report.

    Raises:
    - HTTPException: If the DMARC report is not found.
    """
    report = await DMARCReportModel.find_one({"report_metadata.report_id": report_id})
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DMARC Report not found")
    return report
  
@router.put("/aggregated_report/{report_id}", status_code=status.HTTP_200_OK)
async def update_dmarc_report(report_id: str, updated_data: DMARCReportModel):
    """
    Update a DMARC report with the given report ID and updated data.

    Args:
        report_id (str): The ID of the report to be updated.
        updated_data (DMARCReportModel): The updated data for the report.

    Raises:
        HTTPException: If the report with the given ID does not exist.

    Returns:
        None
    """
    existing_report = await DMARCReportModel.get(report_id)
    if not existing_report:
        raise HTTPException(status_code=status.HTTP_404_)