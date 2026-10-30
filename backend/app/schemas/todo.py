from pydantic import BaseModel
from typing import Optional

class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = ""

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None

class TodoResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = ""
    is_completed: bool
    owner_id: int

    class Config:
        from_attributes = True
