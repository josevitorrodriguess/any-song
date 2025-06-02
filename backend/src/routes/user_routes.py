from fastapi import APIRouter, HTTPException, status, Body, Depends
from fastapi.security import OAuth2PasswordBearer
from src.models import User, TokenData
import firebase_admin
from firebase_admin import auth

user_router = APIRouter(prefix="/users", tags=["users"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/google-signin")


async def get_current_authenticated_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Esta dependência verifica o Firebase ID token fornecido no cabeçalho Authorization.
    Se o token for válido, retorna os dados do usuário.
    Se o token for inválido, ausente ou expirado, levanta uma HTTPException.
    """
    if not token:
        # Este caso é geralmente coberto pelo OAuth2PasswordBearer se o token não for fornecido,
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado (token não fornecido)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        decoded_token = auth.verify_id_token(token)
        return User(
            uid=decoded_token.get("uid"),
            email=decoded_token.get("email"),
            name=decoded_token.get("name"),
            picture=decoded_token.get("picture"),
            email_verified=decoded_token.get("email_verified"),
        )
    except firebase_admin.auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Firebase expirado",
            headers={
                "WWW-Authenticate": 'Bearer error="invalid_token", error_description="Token has expired"'
            },
        )
    except firebase_admin.auth.InvalidIdTokenError as e:
        print(f"Token inválido: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token Firebase inválido: {str(e).split('.')[0]}",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except Exception as e:

        print(f"Erro inesperado na verificação do token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno ao verificar o token de autenticação",
        )


@user_router.post("/auth/google-signin", response_model=User)
async def authenticate_google_user(token_data: TokenData = Body(...)):
    """
    Recebe um Firebase ID Token do cliente (obtido após login com Google),
    verifica o token e retorna informações do usuário se válido.
    """
    id_token = token_data.idToken

    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="idToken ausente no corpo da requisição.",
        )

    try:
        decoded_token = auth.verify_id_token(id_token)

        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        name = decoded_token.get("name")
        picture = decoded_token.get("picture")
        email_verified = decoded_token.get("email_verified")

        # ----- PONTO DE CUSTOMIZAÇÃO -----
        # Aqui você pode adicionar lógica para:
        # 1. Buscar o usuário no seu banco de dados local usando o 'uid'.
        # 2. Se o usuário não existir, criá-lo no seu banco de dados.
        #    Ex: user_in_db = await get_user_from_db(uid)
        #        if not user_in_db:
        #            await create_user_in_db(uid=uid, email=email, name=name, ...)
        # 3. Atualizar informações do usuário (ex: último login, nome, foto).
        # 4. Gerar um token de sessão do seu próprio sistema, se necessário.
        print(f"Usuário autenticado com sucesso: UID={uid}, Email={email}")

        return User(
            uid=uid,
            email=email,
            name=name,
            picture=picture,
            email_verified=email_verified,
        )

    except firebase_admin.auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Firebase inválido ou expirado.",
            headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
        )
    except firebase_admin.auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Firebase expirado.",
            headers={"WWW-Authenticate": 'Bearer error="expired_token"'},
        )
    except Exception as e:
        print(f"Erro inesperado durante a autenticação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno no servidor durante a autenticação.",
        )


@user_router.get("/protected/me")
def protected_route(current_user: User = Depends(get_current_authenticated_user)):
    return current_user
