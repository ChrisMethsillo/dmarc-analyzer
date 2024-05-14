from app import app
import uvicorn
from routers.dmarc_reports import router as DMARCReportRouter

app.include_router(DMARCReportRouter)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug", reload=True)
