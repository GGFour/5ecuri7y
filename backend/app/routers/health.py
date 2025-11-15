from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/ping")
def read_health() -> dict[str, str]:
    return {"status": "ok"}
