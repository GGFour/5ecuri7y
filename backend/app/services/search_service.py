import json
from typing import Any, Dict

from sqlalchemy.orm import Session

from ..models import SearchResult


def save_result(db: Session, query: str, payload: Dict[str, Any]) -> SearchResult:
    record = SearchResult(
        query=query,
        status="completed",
        result_payload=json.dumps(payload),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
