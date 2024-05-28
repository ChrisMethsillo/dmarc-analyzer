from beanie import Document
from pydantic import BaseModel, EmailStr
from typing import Optional
from bson import ObjectId

class User(Document):
    email: EmailStr
    hashed_password: str

    class Settings:
        collection = "users"

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr

    @staticmethod
    def from_user(user: User) -> "UserResponse":
        return UserResponse(id=str(user.id), email=user.email)
