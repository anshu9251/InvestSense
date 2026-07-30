from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.models.user import UserRegister, UserLogin, Token, UserResponse
from app.services.auth_service import (
    create_user,
    authenticate_user,
    create_access_token,
    get_user_by_id,
    decode_access_token,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
security_scheme = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    """Dependency: extracts and validates the user from the JWT token."""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        user_id = decode_access_token(credentials.credentials)
    except JWTError:
        raise credentials_exception

    user = await get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=Token)
async def register(data: UserRegister):
    try:
        user = await create_user(data.email, data.password, data.name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    access_token = create_access_token(user["id"])
    return Token(
        access_token=access_token,
        user=UserResponse(id=user["id"], email=user["email"], name=user["name"]),
    )


@router.post("/login", response_model=Token)
async def login(data: UserLogin):
    user = await authenticate_user(data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(user["id"])
    return Token(
        access_token=access_token,
        user=UserResponse(id=user["id"], email=user["email"], name=user["name"]),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(id=current_user["id"], email=current_user["email"], name=current_user["name"])