
from datetime import timedelta
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import APIKeyHeader, OAuth2PasswordBearer, OAuth2PasswordRequestForm
from utils.auth import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, API_KEYS, SECRET_KEY, create_access_token, get_password_hash, verify_password
from models.users import *
import jwt
from jwt.exceptions import InvalidTokenError
from config import *

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token", auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_user(username: str):
    user = await User.find_one(User.username==username)
    return user

async def authenticate_user(username: str, password: str):
    user = await get_user(username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        token_data = TokenData(username=username)
    except InvalidTokenError:
        return None
    user = await get_user(username=token_data.username)
    if user is None:
        return None
    return UserResponse.from_user(user)

async def authenticate_api_key(api_key: str = Depends(api_key_header)):
    if api_key in API_KEYS:
        return api_key
    return None
    
@router.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

async def get_current_auth(api_key: Optional[str] = Depends(authenticate_api_key), 
                           user: Optional[UserResponse] = Depends(get_current_user)):
    if api_key:
        return True, api_key
    if user:
        return True, user
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

@router.post("/register")
async def register_user(user: UserCreate, auth_user: tuple = Depends(get_current_auth)):
    is_authenticated, auth = auth_user
    if not is_authenticated:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    if type(auth_user) == User and auth_user.user_type != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_exists = await User.find_one({"email": user.email})
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    password = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, user_type=user.user_type, password=password)
    await new_user.insert()

    return {
        "message": "User created successfully",
        "username": user.username,
        "email": user.email,
    }
    
@router.get("/users/me", response_model=UserResponse)
async def read_users_me(user: UserResponse = Depends(get_current_user)):
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user