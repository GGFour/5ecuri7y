from sqlalchemy.orm import declarative_base

Base = declarative_base()

from .search_result import SearchResult  # noqa: E402,F401
from .product_vendor_url import ProductVendorURL  # noqa: E402,F401
