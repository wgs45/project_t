from datetime import datetime, timedelta, timezone
import jwt
import bcrypt
from app.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Safely encode and truncate to 72 bytes to match bcrypt limitations
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def get_password_hash(password: str) -> str:
    # Safely encode and truncate password to 72 bytes, then generate salt & hash
    password_bytes = password.encode('utf-8')[:72]
    hashed_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt(rounds=12))
    return hashed_bytes.decode('utf-8')

def create_access_token(subject: str | int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
