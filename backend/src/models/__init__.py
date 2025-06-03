from .user_model import User as UserDB  # SQLAlchemy model
from .user_schemas import UserFirebase, UserResponse, UserCreate  # Pydantic schemas
from .token_model import TokenData

# For backward compatibility
User = UserFirebase  # The routes expect this name