    
from pydantic import BaseModel, Field, EmailStr
from beanie import Document
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None
    
class User(Document):
    username: str
    email: EmailStr
    user_type: str
    password: str

    class Settings:
        collection = "users"

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    user_type: str
    password: str

class UserResponse(BaseModel):
    username: str
    email: EmailStr
    user_type: str
    @staticmethod
    def from_user(user: User):
        return UserResponse(username=user.username, email=user.email, user_type=user.user_type)

    
    


