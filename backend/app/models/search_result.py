from sqlalchemy import Column, DateTime, Integer, String, Text, func

from . import Base


class SearchResult(Base):
    __tablename__ = "search_results"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="completed")
    result_payload = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
