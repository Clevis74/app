"""
SISMOBI Backend 3.2.0 - Simple Test Server for Consumption Testing
"""
from fastapi import FastAPI, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import json

# Create FastAPI application
app = FastAPI(title="SISMOBI Test API", version="3.2.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class LoginResponse(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: str
    email: str
    name: str

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
    energyUnitName: str

# Mock data
MOCK_USER = {
    "id": "admin",
    "email": "admin@sismobi.com", 
    "name": "SISMOBI Administrator"
}

MOCK_TENANTS = [
    {
        "id": "tenant-1",
        "name": "João Silva (Válido)",
        "email": "joao.silva@email.com",
        "phone": "(11) 99999-1111",
        "cpf": "123.456.789-01",
        "status": "active",
        "propertyId": "property-1",
        "startDate": "2024-01-01",
        "monthlyRent": 1500,
        "deposit": 3000,
        "paymentMethod": "À vista",
        "formalizedContract": True
    },
    {
        "id": "tenant-2", 
        "name": "Maria Ficticia (CPF Inválido)",
        "email": "maria.ficticia@email.com",
        "phone": "(11) 99999-2222",
        "cpf": "000.000.000-00",
        "status": "active",
        "propertyId": "property-2",
        "startDate": "2024-02-01",
        "monthlyRent": 1200,
        "deposit": 2400,
        "paymentMethod": "À vista",
        "formalizedContract": True
    },
    {
        "id": "tenant-3",
        "name": "Carlos Santos (Status Inativo)",
        "email": "carlos.santos@email.com", 
        "phone": "(11) 99999-3333",
        "cpf": "987.654.321-09",
        "status": "inactive",
        "propertyId": "property-3",
        "startDate": "2024-03-01",
        "monthlyRent": 1800,
        "deposit": 3600,
        "paymentMethod": "À vista",
        "formalizedContract": True
    },
    {
        "id": "tenant-4",
        "name": "Ana Oliveira (Sem Propriedade)",
        "email": "ana.oliveira@email.com",
        "phone": "(11) 99999-4444",
        "cpf": "456.789.123-45",
        "status": "active",
        "propertyId": "",
        "startDate": "2024-04-01",
        "monthlyRent": 1400,
        "deposit": 2800,
        "paymentMethod": "À vista",
        "formalizedContract": True
    },
    {
        "id": "tenant-5",
        "name": "Pedro Mendes (CPF Curto)",
        "email": "pedro.mendes@email.com",
        "phone": "(11) 99999-5555",
        "cpf": "123.456.78",
        "status": "active",
        "propertyId": "property-4",
        "startDate": "2024-05-01",
        "monthlyRent": 1600,
        "deposit": 3200,
        "paymentMethod": "À vista",
        "formalizedContract": True
    },
    {
        "id": "tenant-6",
        "name": "Luana Costa (Sem CPF)",
        "email": "luana.costa@email.com",
        "phone": "(11) 99999-6666",
        "cpf": "",
        "status": "active",
        "propertyId": "property-5",
        "startDate": "2024-06-01",
        "monthlyRent": 1700,
        "deposit": 3400,
        "paymentMethod": "À vista",
        "formalizedContract": True
    }
]

MOCK_PROPERTIES = [
    {
        "id": "property-1",
        "name": "Apartamento Centro",
        "address": "Rua das Flores, 123",
        "type": "apartment",
        "status": "rented",
        "rentValue": 1500,
        "energyUnitName": "Apt 101"
    },
    {
        "id": "property-2", 
        "name": "Casa Jardim",
        "address": "Rua dos Pássaros, 456",
        "type": "house",
        "status": "rented", 
        "rentValue": 1200,
        "energyUnitName": "Casa 02"
    },
    {
        "id": "property-3",
        "name": "Loft Moderno",
        "address": "Av. Principal, 789",
        "type": "apartment",
        "status": "rented",
        "rentValue": 1800,
        "energyUnitName": "Loft 301"
    }
]

# Routes
@app.get("/")
async def root():
    return {"message": "SISMOBI Test API", "status": "active"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SISMOBI Test Backend",
        "version": "3.2.0",
        "timestamp": datetime.now().isoformat(),
        "database_status": "connected"
    }

@app.post("/api/v1/auth/login", response_model=LoginResponse)
async def login(username: str = Form(), password: str = Form()):
    if username == "admin@sismobi.com" and password == "admin123456":
        return LoginResponse(access_token="test-token", token_type="bearer")
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/v1/auth/me", response_model=User)
async def get_current_user_info():
    return User(**MOCK_USER)

@app.get("/api/v1/auth/verify")
async def verify_token():
    return {"valid": True, "user": MOCK_USER}

@app.get("/api/v1/tenants/", response_model=List[Tenant])
async def get_tenants():
    return [Tenant(**tenant) for tenant in MOCK_TENANTS]

@app.get("/api/v1/properties/", response_model=List[Property])
async def get_properties():
    return [Property(**prop) for prop in MOCK_PROPERTIES]

@app.get("/api/v1/transactions/")
async def get_transactions():
    return []

@app.get("/api/v1/alerts/")
async def get_alerts():
    return []

@app.get("/api/v1/dashboard/summary")
async def get_dashboard_summary():
    return {
        "totalProperties": len(MOCK_PROPERTIES),
        "totalTenants": len(MOCK_TENANTS),
        "occupiedProperties": len([p for p in MOCK_PROPERTIES if p["status"] == "rented"]),
        "vacantProperties": len([p for p in MOCK_PROPERTIES if p["status"] == "vacant"]),
        "monthlyIncome": 0.0,
        "monthlyExpenses": 0.0,
        "pendingAlerts": 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)