from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.product_vendor_url import ProductVendorURL
from ..schemas.statistics import ProductStatisticsResponse

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("/{prod_id}", response_model=ProductStatisticsResponse)
def get_product_statistics(prod_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        select(ProductVendorURL.id, ProductVendorURL.json).where(ProductVendorURL.id == prod_id)
    ).first()

    if result is None:
        raise HTTPException(status_code=404, detail="Product statistics not found")

    return ProductStatisticsResponse(id=result.id, json=result.json)
