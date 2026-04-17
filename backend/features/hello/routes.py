from fastapi import APIRouter

from .service import get_greeting

router = APIRouter(prefix="/hello", tags=["hello"])


@router.get("/")
def hello_world() -> dict:
    return get_greeting()
