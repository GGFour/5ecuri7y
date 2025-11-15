from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.search import TriggerN8NRequest, TriggerN8NResponse, N8NWebhookRequest
from ..config import get_settings
from ..services import n8n_client, search_service

router = APIRouter(prefix="/api", tags=["n8n"])


@router.post("/trigger-n8n", response_model=TriggerN8NResponse)
async def trigger_n8n(payload: TriggerN8NRequest, db: Session = Depends(get_db)):
    settings = get_settings()
    internal_payload = N8NWebhookRequest(
        input_term=payload.input_term, jwt=settings.n8n_jwt_token
    )
    result = await n8n_client.trigger_flow(internal_payload.model_dump())
    record = search_service.save_result(db, payload.input_term, result)

    return TriggerN8NResponse(
        message="n8n flow triggered successfully",
        data=result,
        record=record,
    )
