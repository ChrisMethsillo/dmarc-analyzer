from contextlib import asynccontextmanager
from fastapi import FastAPI
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.middleware.cors import CORSMiddleware
from config import CONFIG
from models.dmarc_report import *




DESCRIPTION = """
This API powers whatever I want to make

It supports:

- Account sign-up and management
- Something really cool that will blow your socks off
"""


@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore
    

    app.db = AsyncIOMotorClient(CONFIG.mongo_uri).account 
    await init_beanie(app.db, document_models=[
        DMARCReportModel
        ]) 
    print("Startup complete")
    yield
    print("Shutdown complete")

#add cors middleware


app = FastAPI(
    title="My Server",
    lifespan=lifespan,
)

app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

