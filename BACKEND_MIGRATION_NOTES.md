# 🚀 Backend Migration Notes - Python → Go

## 📊 Estrutura Atual (Python/FastAPI)

### 🔧 Modelos de Dados

#### User Model (PostgreSQL)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    picture VARCHAR,
    email_verified BOOLEAN DEFAULT FALSE
);
```

#### User Schemas (API)
```json
// UserResponse
{
  "id": "uuid",
  "email": "email@example.com", 
  "name": "User Name",
  "picture": "https://photo.url",
  "email_verified": true
}

// UserFirebase  
{
  "uid": "firebase_uid",
  "email": "email@example.com",
  "name": "User Name", 
  "picture": "https://photo.url",
  "email_verified": true
}
```

### 🔐 Autenticação Atual
- **Firebase Admin SDK** para validação de tokens
- **JWT tokens** do Firebase no frontend
- Header: `Authorization: Bearer <firebase_token>`

### 📡 Endpoints Necessários

#### User Management
```
POST   /users/          # Create user from Firebase token
GET    /users/me        # Get current user info  
PUT    /users/me        # Update user profile
DELETE /users/me        # Delete user account
```

#### Auth
```
POST   /auth/verify     # Verify Firebase token
POST   /auth/refresh    # Refresh user session
```

### 🌐 CORS Configuration
```
Allow-Origins: http://localhost:3000
Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Allow-Headers: Authorization, Content-Type
Allow-Credentials: true
```

### 🔧 Environment Variables
```env
# Database
DB_HOST=db
DB_NAME=anysong_db  
DB_USER=anysong_user
DB_PASSWORD=anysong_password
DB_PORT=5432

# Firebase
FIREBASE_PROJECT_ID=any-song-c2d0c
FIREBASE_CREDENTIALS_PATH=./config/firebase-credentials.json
```

## 🎯 Arquitetura Sugerida (Go)

### Stack Recomendada
- **Framework**: Gin ou Fiber
- **Database**: GORM + PostgreSQL
- **Auth**: Firebase Admin SDK Go
- **Validation**: go-playground/validator
- **Config**: Viper

### Estrutura de Diretórios
```
backend/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   ├── models/
│   ├── handlers/
│   ├── middleware/
│   ├── services/
│   └── database/
├── pkg/
├── config/
│   └── firebase-credentials.json
└── go.mod
```

## 🔄 Pontos de Integração

### Frontend → Backend
- Mesmos endpoints e JSONs
- Firebase tokens continuam iguais
- Nenhuma mudança no frontend

### Backend → AI Processing  
- **POST** `/ai/process` - Enviar áudio para processamento
- **GET** `/ai/status/{job_id}` - Status do processamento
- **GET** `/ai/result/{job_id}` - Baixar resultado

### Database
- Migrar modelos existentes
- Manter UUIDs e constraints
- Adicionar tabelas para jobs/processing

## ✅ Todo List

- [ ] Setup Go project with Gin
- [ ] Configure GORM + PostgreSQL  
- [ ] Implement Firebase Auth middleware
- [ ] Migrate User model and endpoints
- [ ] Add CORS configuration
- [ ] Setup Docker containerization
- [ ] Add logging and error handling
- [ ] Integrate with AI processing service

## 🔗 Recursos Úteis

- [Gin Framework](https://gin-gonic.com/)
- [GORM](https://gorm.io/)
- [Firebase Admin SDK Go](https://firebase.google.com/docs/admin/setup#go)
- [Go Validator](https://github.com/go-playground/validator) 