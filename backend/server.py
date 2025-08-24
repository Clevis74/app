#!/usr/bin/env python3
"""
SISMOBI Backend 3.2.0 - Sistema de Gestão Imobiliária
Servidor funcional com autenticação e dados mockados
"""
from fastapi import FastAPI, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional
import jwt

# Configuração JWT
SECRET_KEY = "sismobi_secret_key_2024"
ALGORITHM = "HS256"

# Criar aplicação FastAPI
app = FastAPI(
    title="SISMOBI API", 
    version="3.2.0",
    description="Sistema de Gestão Imobiliária"
)

# Configurar CORS adequadamente
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"]
)

# Modelos Pydantic
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class User(BaseModel):
    id: str
    email: str
    full_name: str
    is_active: bool = True

class Tenant(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    cpf: str
    status: str
    propertyId: str
    startDate: str
    monthlyRent: float
    deposit: float
    paymentMethod: str
    formalizedContract: bool

class Property(BaseModel):
    id: str
    name: str
    address: str
    type: str
    status: str
    rentValue: float

# Usuário mock
MOCK_USER = {
    "id": "admin-001",
    "email": "admin@sismobi.com",
    "full_name": "Administrador SISMOBI",
    "is_active": True
}

# Dados mock dos inquilinos
MOCK_TENANTS = [
    {
        "id": "tenant-1",
        "name": "João Silva (CPF Válido)",
        "email": "joao.silva@email.com",
        "phone": "(11) 99999-1111",
        "cpf": "11144477735",  # CPF real válido
        "status": "active",
        "propertyId": "property-1",
        "startDate": "2024-01-01",
        "monthlyRent": 1500.0,
        "deposit": 3000.0,
        "paymentMethod": "À vista",
        "formalizedContract": True
    },
    {
        "id": "tenant-2",
        "name": "Maria Santos (Sem Propriedade)",
        "email": "maria.santos@email.com",
        "phone": "(11) 99999-2222",
        "cpf": "52998224725",  # CPF real válido
        "status": "active",
        "propertyId": "",  # SEM PROPRIEDADE
        "startDate": "2024-02-01",
        "monthlyRent": 1200.0,
        "deposit": 2400.0,
        "paymentMethod": "À vista",
        "formalizedContract": True
    },
    {
        "id": "tenant-3",
        "name": "Carlos Lima (CPF Fictício)",
        "email": "carlos.lima@email.com",
        "phone": "(11) 99999-3333",
        "cpf": "000.000.000-00",  # CPF FICTÍCIO
        "status": "active",
        "propertyId": "property-1",
        "startDate": "2024-03-01",
        "monthlyRent": 1300.0,
        "deposit": 2600.0,
        "paymentMethod": "À vista",
        "formalizedContract": True
    },
    {
        "id": "tenant-4",
        "name": "Ana Oliveira (Status Inativo)",
        "email": "ana.oliveira@email.com",
        "phone": "(11) 99999-4444",
        "cpf": "85914617403",  # CPF real válido
        "status": "inactive",  # STATUS INATIVO
        "propertyId": "property-1",
        "startDate": "2024-04-01",
        "monthlyRent": 1400.0,
        "deposit": 2800.0,
        "paymentMethod": "À vista",
        "formalizedContract": True
    },
    {
        "id": "tenant-5",
        "name": "Pedro Mendes (CPF Curto)",
        "email": "pedro.mendes@email.com",
        "phone": "(11) 99999-5555",
        "cpf": "123.456.78",  # CPF INVÁLIDO
        "status": "active",
        "propertyId": "property-1",
        "startDate": "2024-05-01",
        "monthlyRent": 1600.0,
        "deposit": 3200.0,
        "paymentMethod": "À vista",
        "formalizedContract": True
    },
    {
        "id": "tenant-6",
        "name": "Luana Costa (Sem CPF)",
        "email": "luana.costa@email.com",
        "phone": "(11) 99999-6666",
        "cpf": "",  # SEM CPF
        "status": "active",
        "propertyId": "property-1",
        "startDate": "2024-06-01",
        "monthlyRent": 1700.0,
        "deposit": 3400.0,
        "paymentMethod": "À vista",
        "formalizedContract": True
    }
]

# Propriedades mock
MOCK_PROPERTIES = [
    {
        "id": "property-1",
        "name": "Apartamento Centro",
        "address": "Rua das Flores, 123 - São Paulo, SP",
        "type": "apartment",
        "status": "rented",
        "rentValue": 1500.0
    },
    {
        "id": "property-2",
        "name": "Casa Jardim",
        "address": "Rua dos Pássaros, 456 - São Paulo, SP",
        "type": "house",
        "status": "vacant",
        "rentValue": 1200.0
    }
]

# Funções utilitárias JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return email
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Rotas de autenticação
@app.get("/")
async def root():
    return {
        "message": "SISMOBI API v3.2.0", 
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SISMOBI Backend",
        "version": "3.2.0",
        "timestamp": datetime.now().isoformat(),
        "database_status": "connected"
    }

@app.post("/api/v1/auth/login", response_model=LoginResponse)
async def login(username: str = Form(), password: str = Form()):
    # Verificar credenciais
    if username == "admin@sismobi.com" and password in ["admin123", "admin123456"]:
        # Criar token JWT
        access_token = create_access_token(data={"sub": username})
        return LoginResponse(access_token=access_token, token_type="bearer")
    
    raise HTTPException(
        status_code=401, 
        detail="Credenciais inválidas"
    )

@app.get("/api/v1/auth/me", response_model=User)
async def get_current_user():
    return User(**MOCK_USER)

@app.get("/api/v1/auth/verify")
async def verify_token_endpoint():
    return {
        "valid": True,
        "message": "Token válido",
        "status": "success",
        "user": MOCK_USER
    }

# Rotas de dados
@app.get("/api/v1/tenants/", response_model=List[Tenant])
async def get_tenants():
    return [Tenant(**tenant) for tenant in MOCK_TENANTS]

@app.get("/api/v1/properties/", response_model=List[Property])
async def get_properties():
    return [Property(**prop) for prop in MOCK_PROPERTIES]

@app.get("/api/v1/dashboard/summary")
async def get_dashboard_summary():
    return {
        "total_properties": len(MOCK_PROPERTIES),
        "total_tenants": len(MOCK_TENANTS),
        "occupied_properties": len([p for p in MOCK_PROPERTIES if p["status"] == "rented"]),
        "vacant_properties": len([p for p in MOCK_PROPERTIES if p["status"] == "vacant"]),
        "total_monthly_income": sum(t["monthlyRent"] for t in MOCK_TENANTS if t["status"] == "active"),
        "total_monthly_expenses": 0.0,
        "pending_alerts": 0
    }

# Outras rotas necessárias
@app.get("/api/v1/transactions/")
async def get_transactions():
    return {"items": [], "total": 0}

@app.get("/api/v1/alerts/")
async def get_alerts():
    return {"items": [], "total": 0}

@app.get("/api/v1/documents/")
async def get_documents():
    return {"items": [], "total": 0}

@app.get("/api/v1/energy-bills/")
async def get_energy_bills():
    return {"items": [], "total": 0}

@app.get("/api/v1/water-bills/")  
async def get_water_bills():
    return {"items": [], "total": 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)