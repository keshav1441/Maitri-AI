from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.scheme_matching import match_schemes, get_scheme_by_id, SCHEMES_DB

router = APIRouter(prefix="/schemes", tags=["schemes"])

class SchemeRequest(BaseModel):
    scheme_id: str

@router.get("/")
async def get_all_schemes():
    return {"schemes": SCHEMES_DB}

@router.post("/")
async def get_scheme(request: SchemeRequest):
    scheme = await get_scheme_by_id(request.scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return {"scheme": scheme}