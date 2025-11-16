import asyncio
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.main import app
from app.database import get_db
import httpx, json

client = TestClient(app)


class FakeResult:
    def __init__(self, row):
        self._row = row

    def first(self):
        return self._row


class FakeSession:
    def __init__(self, row):
        self._row = row

    def execute(self, _):
        return FakeResult(self._row)


def override_get_db_with_row(row):
    def _override():
        yield FakeSession(row)

    return _override


def test_health_ping():
    response = client.get("/health/ping")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_trigger_n8n_returns_passthrough(monkeypatch):
    async def fake_trigger(payload):
        await asyncio.sleep(0)
        request = httpx.Request("POST", "http://test")
        return httpx.Response(
            status_code=200,
            request=request,
            content=json.dumps({"echo": payload["query"], "status": "mocked"}).encode(),
            headers={"Content-Type": "application/json"},
        )

    monkeypatch.setattr("app.services.n8n_client.trigger_flow", fake_trigger)

    response = client.post("/api/trigger-n8n", json={"query": "hello"})
    assert response.status_code == 200
    data = response.json()
    assert data["echo"] == "hello"


def test_get_statistics_returns_payload():
    row = SimpleNamespace(id=123, json='{"key": "value"}')
    app.dependency_overrides[get_db] = override_get_db_with_row(row)

    response = client.get("/api/statistics/123")

    assert response.status_code == 200
    assert response.json() == {"id": 123, "json": row.json}

    app.dependency_overrides.pop(get_db, None)


def test_get_statistics_not_found():
    app.dependency_overrides[get_db] = override_get_db_with_row(None)

    response = client.get("/api/statistics/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Product statistics not found"

    app.dependency_overrides.pop(get_db, None)
