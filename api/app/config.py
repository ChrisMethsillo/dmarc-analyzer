from decouple import config
from pydantic import BaseModel

class Settings(BaseModel):
    """Server config settings."""
    root_url: str = config("ROOT_URL", default="http://localhost:8080")
    mongo_uri: str = config("MONGO_URI")
    SECRET_KEY: str = config("SECRET_KEY")
    ALGORITHM : str = config("ALGORITHM", default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES : int = config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30, cast=int)

CONFIG = Settings()