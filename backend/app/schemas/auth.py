from typing import Optional

from pydantic import BaseModel


class AuthUser(BaseModel):
    id: str
    name: str
    email: str
    role: str
    plan: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser


class ForgotPasswordRequest(BaseModel):
    email: str
