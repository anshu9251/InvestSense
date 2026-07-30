import os
import uuid
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.db.connection import db

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
users_collection = db["users"]


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str:
    """Returns the user_id from the token, or raises an exception if invalid."""
    payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
    user_id: str = payload.get("sub")
    if user_id is None:
        raise JWTError("Token missing subject")
    return user_id


async def get_user_by_email(email: str):
    return await users_collection.find_one({"email": email})


async def get_user_by_id(user_id: str):
    return await users_collection.find_one({"id": user_id})


async def create_user(email: str, password: str, name: str) -> dict:
    existing = await get_user_by_email(email)
    if existing:
        raise ValueError("Email already registered")

    user_doc = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": name,
        "hashed_password": hash_password(password),
        "created_at": datetime.utcnow(),
    }
    await users_collection.insert_one(user_doc)
    return user_doc


async def authenticate_user(email: str, password: str):
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user