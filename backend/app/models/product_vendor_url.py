from sqlalchemy import Column, DateTime, Integer, String, Text, func

from . import Base


class ProductVendorURL(Base):
    __tablename__ = "product_vendor_url"

    id = Column(Integer, primary_key=True, index=True)
    raw_name = Column(String(255), nullable=False)
    canonical_name = Column(String(255), nullable=False)
    vendor = Column(String(255), nullable=False)
    url = Column(Text, nullable=True)
    json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
