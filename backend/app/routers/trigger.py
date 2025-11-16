from fastapi import APIRouter, Response

from ..schemas.search import TriggerN8NRequest, N8NWebhookRequest
from ..config import get_settings
from ..services import n8n_client

router = APIRouter(prefix="/api", tags=["n8n"])


@router.post("/trigger-n8n")
async def trigger_n8n(payload: TriggerN8NRequest):
    """Proxy trigger request to n8n and forward its raw response.

    Accepts client parameters, injects server-side JWT, then returns
    exactly what n8n replies (status, headers, body) without persistence.
    """
    settings = get_settings()
    internal_payload = N8NWebhookRequest(
        query=payload.query, jwt=settings.n8n_jwt_token
    )
    n8n_response = await n8n_client.trigger_flow(internal_payload.model_dump())

    # Build FastAPI Response preserving status and content-type
    content_type = n8n_response.headers.get("content-type") or "application/json"
    return Response(
        content=n8n_response.content,
        status_code=n8n_response.status_code,
        media_type=content_type,
        headers={
            k: v
            for k, v in n8n_response.headers.items()
            if k.lower() in ["content-type"]
        },
    )
