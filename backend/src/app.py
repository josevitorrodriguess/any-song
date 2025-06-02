from fastapi import FastAPI
import firebase_admin
from firebase_admin import credentials
from src.routes.user_routes import user_router

try:

    cred_path = "src/config/any-song-c2d0c-firebase-adminsdk-fbsvc-515f772e93.json"
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK inicializado com sucesso!")
except FileNotFoundError:
    print(
        f"ERRO: Arquivo de credenciais Firebase não encontrado em '{cred_path}'. Verifique o caminho."
    )

except Exception as e:
    print(f"Erro ao inicializar o Firebase Admin SDK: {e}")

app = FastAPI()
app.include_router(
    user_router,
)


@app.get("/ping")
def ping_root():
    return {"message": "pong"}
