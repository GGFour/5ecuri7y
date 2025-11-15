import asyncio
from typing import Any, Dict

import httpx

from ..config import get_settings


settings = get_settings()


async def trigger_flow(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Trigger the external n8n workflow and return the response."""

    async with httpx.AsyncClient(timeout=settings.n8n_timeout_seconds) as client:
        try:
            response = await client.post(settings.n8n_webhook_url, json=payload)
            response.raise_for_status()
            data = response.json()
        except Exception:
            # Fallback mock response for local dev/demo when webhook unavailable
            await asyncio.sleep(0.5)
            data = {"echo": payload.get("inputTerm"), "status": "mocked"}
    return data
