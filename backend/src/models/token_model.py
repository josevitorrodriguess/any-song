from pydantic import BaseModel


class TokenData(BaseModel):
    idToken: str
