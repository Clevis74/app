"""
SISMOBI Backend 3.2.0 - Minimal FastAPI server for testing consumption functionality
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uuid
from datetime import datetime

# Create FastAPI application
app = FastAPI(title="SISMOBI API", version="3.2.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://tenant-utilities.preview.emergentagent.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample data for testing
sample_properties = [
    {
        "id": "prop-1",
        "name": "Apartamento 802-Ca 01",
        "address": "Rua das Flores, 802",
        "energyUnitName": "802-Ca 01",
        "type": "apartment",
        "purchasePrice": 150000.0,
        "rentValue": 1200.0,
        "status": "rented",
        "createdAt": datetime.now().isoformat()
    },
    {
        "id": "prop-2", 
        "name": "Apartamento 802-Ca 02",
        "address": "Rua das Flores, 802",
        "energyUnitName": "802-Ca 02",
        "type": "apartment",
        "purchasePrice": 150000.0,
        "rentValue": 1200.0,
        "status": "rented",
        "createdAt": datetime.now().isoformat()
    }
]

sample_tenants = [
    {
        "id": "tenant-1",
        "propertyId": "prop-1",
        "name": "João Silva",
        "email": "joao@example.com",
        "cpf": "123.456.789-01",
        "phone": "(11) 99999-1234",
        "startDate": datetime.now().isoformat(),
        "monthlyRent": 1200.0,
        "deposit": 1200.0,
        "status": "active"
    },
    {
        "id": "tenant-2",
        "propertyId": "prop-2", 
        "name": "Maria Ficticia",
        "email": "maria@example.com",
        "cpf": "000.000.000-00",  # CPF fictício - botão não deve aparecer
        "phone": "(11) 99999-5678",
        "startDate": datetime.now().isoformat(),
        "monthlyRent": 1200.0,
        "deposit": 1200.0,
        "status": "active"
    }
]

sample_energy_bills = [
    {
        "id": "energy-1",
        "date": datetime.now().isoformat(),
        "observations": "Conta de energia grupo 802",
        "isPaid": True,
        "createdAt": datetime.now().isoformat(),
        "lastUpdated": datetime.now().isoformat(),
        "groupId": "grupo-802",
        "groupName": "Grupo 802 - Bloco Principal",
        "totalGroupValue": 450.00,
        "totalGroupConsumption": 850.0,
        "propertiesInGroup": [
            {
                "id": "grupo-802-802-Ca 01",
                "name": "802-Ca 01",
                "propertyId": "prop-1",
                "tenantId": "tenant-1",
                "tenantName": "João Silva",
                "currentReading": 1500.0,
                "previousReading": 1150.0,
                "monthlyConsumption": 350.0,
                "hasMeter": True,
                "proportionalValue": 185.30,
                "proportionalConsumption": 350.0,
                "groupId": "grupo-802",
                "isResidualReceiver": False,
                "isPaid": True
            },
            {
                "id": "grupo-802-802-Ca 02", 
                "name": "802-Ca 02",
                "propertyId": "prop-2",
                "tenantId": "tenant-2",
                "tenantName": "Maria Ficticia",
                "currentReading": 1200.0,
                "previousReading": 700.0,
                "monthlyConsumption": 500.0,
                "hasMeter": True,
                "proportionalValue": 264.70,
                "proportionalConsumption": 500.0,
                "groupId": "grupo-802",
                "isResidualReceiver": False,
                "isPaid": False
            }
        ]
    }
]

sample_water_bills = [
    {
        "id": "water-1",
        "date": datetime.now().isoformat(),
        "observations": "Conta de água grupo 802",
        "isPaid": True,
        "createdAt": datetime.now().isoformat(),
        "lastUpdated": datetime.now().isoformat(),
        "groupId": "grupo-802",
        "groupName": "Grupo 802 - Bloco Principal",
        "totalGroupValue": 120.00,
        "totalGroupPeople": 5,
        "propertiesInGroup": [
            {
                "id": "grupo-802-802-Ca 01",
                "name": "802-Ca 01",
                "propertyId": "prop-1",
                "tenantId": "tenant-1", 
                "tenantName": "João Silva",
                "numberOfPeople": 2,
                "proportionalValue": 48.00,
                "groupId": "grupo-802",
                "isPaid": True
            },
            {
                "id": "grupo-802-802-Ca 02",
                "name": "802-Ca 02", 
                "propertyId": "prop-2",
                "tenantId": "tenant-2",
                "tenantName": "Maria Ficticia",
                "numberOfPeople": 3,
                "proportionalValue": 72.00,
                "groupId": "grupo-802",
                "isPaid": False
            }
        ]
    }
]

@app.get("/")
async def root():
    return {
        "message": "SISMOBI API 3.2.0 is running",
        "status": "active", 
        "timestamp": datetime.now().isoformat(),
        "version": "3.2.0"
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

@app.get("/api/v1/properties")
async def get_properties():
    return sample_properties

@app.get("/api/v1/tenants") 
async def get_tenants():
    return sample_tenants

@app.get("/api/v1/energy-bills")
async def get_energy_bills():
    return sample_energy_bills

@app.get("/api/v1/water-bills")
async def get_water_bills():
    return sample_water_bills

@app.get("/api/v1/documents")
async def get_documents():
    return []

@app.get("/api/v1/alerts")
async def get_alerts():
    return []

@app.get("/api/v1/transactions")
async def get_transactions():
    return []

@app.get("/api/v1/dashboard/summary")
async def get_dashboard_summary():
    return {
        "total_properties": 2,
        "total_tenants": 2,
        "occupied_properties": 2,
        "vacant_properties": 0,
        "total_monthly_income": 2400.0,
        "total_monthly_expenses": 0.0,
        "pending_alerts": 0,
        "recent_transactions": []
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)