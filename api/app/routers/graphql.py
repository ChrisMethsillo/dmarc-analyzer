from fastapi import APIRouter
from starlette_graphene3 import GraphQLApp, make_graphiql_handler
from schemas.dmarc_report import schema

router = APIRouter()
router.add_route("/graphql", GraphQLApp(schema=schema, on_get=make_graphiql_handler()), methods=["GET", "POST", "PUT", "DELETE"])