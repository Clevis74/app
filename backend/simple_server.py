#!/usr/bin/env python3
"""
SISMOBI Backend Simples - Versão funcional
"""
from fastapi import FastAPI, Form, HTTPException
from datetime import datetime
import json

app = FastAPI()

# Dados mock
MOCK_USER = {
    "id": "admin-001",
    "email": "admin@sismobi.com",
    "full_name": "Administrador SISMOBI",
    "is_active": True
}

MOCK_TENANTS = [
    {
        "id": "tenant-1",
        "name": "João Silva (CPF Válido)",
        "email": "joao.silva@email.com",
        "phone": "(11) 99999-1111",
        "cpf": "11144477735",
        "status": "active",
        "propertyId": "property-1",
        "startDate": "2024-01-01",
        "monthlyRent": 1500.0,
        "deposit": 3000.0,
        "paymentMethod": "À vista",
        "formalizedContract": True
    }
]

# Headers CORS manuais
@app.middleware("http")
async def cors_handler(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.options("/{path:path}")
async def options_handler(path: str):
    return {"message": "OK"}

@app.get("/")
async def root():
    return {"message": "SISMOBI API v3.2.0", "status": "online"}

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "service": "SISMOBI Backend",
        "version": "3.2.0",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v1/auth/login")
async def login(username: str = Form(), password: str = Form()):
    if username == "admin@sismobi.com" and password in ["admin123", "admin123456"]:
        return {
            "access_token": "mock-jwt-token-123",
            "token_type": "bearer"
        }
    raise HTTPException(status_code=401, detail="Credenciais inválidas")

@app.get("/api/v1/auth/me")
async def get_user():
    return MOCK_USER

@app.get("/api/v1/auth/verify")
async def verify():
    return {"valid": True, "user": MOCK_USER, "message": "Token válido", "status": "success"}

@app.get("/api/v1/tenants/")
async def get_tenants():
    return MOCK_TENANTS

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)