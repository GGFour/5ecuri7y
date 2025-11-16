import logging
from typing import Any, Dict

import httpx

from ..config import get_settings


settings = get_settings()

logger = logging.getLogger("n8n_client")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)


async def trigger_flow(payload: Dict[str, Any]) -> httpx.Response:
    """Trigger the external n8n workflow and return the raw HTTP response.

    No status filtering or transformation is applied so the router can
    transparently forward status, headers and body to the client.
    """

    logger.info(f"Triggering n8n workflow with payload: {payload}")
    async with httpx.AsyncClient(timeout=settings.n8n_timeout_seconds) as client:
        try:
            response = await client.post(
                settings.n8n_webhook_url,
                json=payload,
                headers={"Authorization": f"Bearer {settings.n8n_jwt_token}"},
            )
        except httpx.HTTPError as exc:
            logger.error(f"n8n request failed: {exc}")
            # Create synthetic error response to forward
            request = httpx.Request("POST", settings.n8n_webhook_url)
            response = httpx.Response(
                status_code=502,
                request=request,
                content=b'{"error":"Bad Gateway","detail":"n8n unreachable"}',
                headers={"Content-Type": "application/json"},
            )
    logger.info(
        f"n8n workflow responded status={response.status_code} content-type={response.headers.get('content-type')}"
    )
    return response
