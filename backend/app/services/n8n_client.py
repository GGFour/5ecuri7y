import asyncio
import logging
from typing import Any, Dict

import json
import httpx

from ..config import get_settings


settings = get_settings()

# Configure logger locally to ensure INFO messages are emitted even if
# the application hasn't set up global logging. Safe no-op if handlers exist.
logger = logging.getLogger("n8n_client")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)


async def trigger_flow(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Trigger the external n8n workflow and return the response."""

    logger.info(f"Triggering n8n workflow with payload: {payload}")
    async with httpx.AsyncClient(timeout=settings.n8n_timeout_seconds) as client:
        try:
            response = await client.post(
                settings.n8n_webhook_url,
                json=payload,
                headers={"Authorization": f"Bearer {settings.n8n_jwt_token}"},
            )
            response.raise_for_status()
            data = response.json()
        except Exception:
            # Fallback mock response for local dev/demo when webhook unavailable
            await asyncio.sleep(0.5)
            data = {"echo": payload.get("input_term"), "status": "mocked"}
    logger.info(f"n8n workflow response: {json.dumps(data, indent=2)}")
    return data
