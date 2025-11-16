from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class TriggerN8NRequest(BaseModel):
    query: str


class N8NWebhookRequest(BaseModel):
    """Internal schema for the outgoing n8n webhook request.

    Includes the server-side JWT so we never expose it via the public
    API request body. Built inside the router before dispatching to n8n.
    """

    query: str
    jwt: str


class SearchResultSchema(BaseModel):
    id: int
    query: str
    status: str
    result_payload: Any
    created_at: datetime

    # Pydantic v2 replacement for orm_mode to allow attribute access
    model_config = ConfigDict(from_attributes=True)


class TriggerN8NResponse(BaseModel):
    message: str
    data: Optional[Any]
    record: Optional[SearchResultSchema]
