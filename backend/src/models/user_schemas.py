from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[str] = None
    email_verified: bool = False


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: str
    
    class Config:
        from_attributes = True  # For Pydantic v2 compatibility


class UserFirebase(BaseModel):
    """Firebase user data model"""
    uid: str
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[str] = None  
    email_verified: bool = False 