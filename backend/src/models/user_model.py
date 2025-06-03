import uuid
from sqlalchemy.dialects.postgresql import UUID
from database import Base
from sqlalchemy import (
    Boolean,
    Column,
    String,
    text
)


class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
        index=True,
    )
    email = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    email_verified = Column(Boolean, default=False)
