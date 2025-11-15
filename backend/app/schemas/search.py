from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class TriggerN8NRequest(BaseModel):
    inputTerm: str


class SearchResultSchema(BaseModel):
    id: int
    input_term: str
    status: str
    result_payload: Any
    created_at: datetime

    class Config:
        orm_mode = True


class TriggerN8NResponse(BaseModel):
    message: str
    data: Optional[Any]
    record: Optional[SearchResultSchema]
