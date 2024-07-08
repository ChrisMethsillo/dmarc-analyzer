from fastapi import APIRouter, Depends, HTTPException, status
from strawberry.fastapi import GraphQLRouter
from routers.auth import get_current_auth
from schemas.dmarc_report import schema


router = APIRouter()
graphql_app = GraphQLRouter(schema)

router.include_router(graphql_app, prefix="/graphql")
