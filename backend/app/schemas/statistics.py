from typing import Optional

from pydantic import BaseModel


class ProductStatisticsResponse(BaseModel):
    id: int
    json: Optional[str]
