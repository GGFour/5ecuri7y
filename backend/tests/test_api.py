import asyncio

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_ping():
    response = client.get("/health/ping")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_trigger_n8n_returns_payload(monkeypatch):
    async def fake_trigger(payload):
        await asyncio.sleep(0)
        return {"echo": payload["inputTerm"], "status": "mocked"}

    monkeypatch.setattr("app.services.n8n_client.trigger_flow", fake_trigger)

    class DummyRecord:
        def __init__(self, input_term):
            self.id = 1
            self.input_term = input_term
            self.status = "completed"
            self.result_payload = "{}"
            import datetime

            self.created_at = datetime.datetime.utcnow()

    monkeypatch.setattr("app.services.search_service.save_result", lambda db, term, payload: DummyRecord(term))

    response = client.post("/api/trigger-n8n", json={"inputTerm": "hello"})
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["echo"] == "hello"
