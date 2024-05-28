from app import app
import uvicorn
from routers.dmarc_reports import router as DMARCReportRouter
from routers.auth import router as AuthRouter
from routers.graphql import router as GraphQLRouter

app.include_router(DMARCReportRouter, prefix="/api/v1", tags=["api","dmarc_reports"])
app.include_router(AuthRouter,prefix="/auth",tags=["auth"])
app.include_router(GraphQLRouter, prefix="/api", tags=["graphql", "dmarc_reports"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug", reload=True)
