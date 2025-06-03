# 🐳 Docker Setup - AnySong

Este guia explica como executar o projeto AnySong usando Docker.

## 📋 Pré-requisitos

- Docker
- Docker Compose

## 🚀 Como Executar

### Executar todos os serviços
```bash
# Na raiz do projeto
docker-compose up --build
```

### Executar em background
```bash
docker-compose up -d --build
```

### Parar os serviços
```bash
docker-compose down
```

## 🌐 Acessos

- **Frontend (Next.js)**: http://localhost:3000
- **Backend (FastAPI)**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Serviços

### Frontend
- **Porta**: 3000
- **Tecnologia**: Next.js 
- **Build**: Multi-stage com otimizações

### Backend  
- **Porta**: 8000
- **Tecnologia**: FastAPI + Firebase
- **Hot Reload**: Habilitado em desenvolvimento

## 📁 Estrutura de Volumes

```
frontend/
├── /app                    # Código fonte
├── /app/node_modules       # Dependências (volume)
└── /app/.next             # Build cache (volume)

backend/
└── /app/src               # Código fonte (hot reload)
```

## 🛠️ Comandos Úteis

### Rebuild apenas um serviço
```bash
docker-compose up --build frontend
docker-compose up --build backend
```

### Ver logs
```bash
docker-compose logs frontend
docker-compose logs backend
docker-compose logs -f  # Follow logs
```

### Acessar container
```bash
docker-compose exec frontend sh
docker-compose exec backend bash
```

### Limpar tudo
```bash
docker-compose down --volumes --rmi all
```

## 🔄 Desenvolvimento

### Hot Reload
- **Frontend**: Mudanças em `/frontend` são detectadas automaticamente
- **Backend**: Mudanças em `/backend/src` são detectadas automaticamente

### Instalar novas dependências

**Frontend:**
```bash
# Parar o container
docker-compose stop frontend

# Adicionar dependência ao package.json
# Depois rebuild
docker-compose up --build frontend
```

**Backend:**
```bash
# Parar o container  
docker-compose stop backend

# Adicionar dependência ao requirements.txt
# Depois rebuild
docker-compose up --build backend
```

## 🐛 Troubleshooting

### Problema: Containers não iniciam
```bash
# Verificar logs
docker-compose logs

# Limpar cache e rebuild
docker-compose down --volumes
docker-compose up --build
```

### Problema: Porta já em uso
```bash
# Verificar processos na porta
lsof -i :3000
lsof -i :8000

# Ou alterar as portas no docker-compose.yml
```

### Problema: Volumes não sincronizam
```bash
# Parar e remover volumes
docker-compose down --volumes

# Subir novamente
docker-compose up --build
``` 