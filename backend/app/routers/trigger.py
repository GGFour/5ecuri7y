from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.search import TriggerN8NRequest, TriggerN8NResponse
from ..services import n8n_client, search_service

router = APIRouter(prefix="/api", tags=["n8n"])


@router.post("/trigger-n8n", response_model=TriggerN8NResponse)
async def trigger_n8n(payload: TriggerN8NRequest, db: Session = Depends(get_db)):
    result = await n8n_client.trigger_flow(payload.model_dump())
    record = search_service.save_result(db, payload.inputTerm, result)

    return TriggerN8NResponse(
        message="n8n flow triggered successfully",
        data=result,
        record=record,
    )
