"""
SISMOBI Backend 3.2.0 - Sistema de Gestão Imobiliária
Complete FastAPI server with full functionality
"""
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import structlog

# Import configurations and database
from config import settings
from database import connect_to_mongo, close_mongo_connection, get_database
from models import DashboardSummary, HealthResponse, MessageResponse, User
from auth import get_current_active_user, create_user
from utils import calculate_dashboard_summary

# Import routers
from routers.auth import router as auth_router
from routers.properties import router as properties_router
from routers.tenants import router as tenants_router  
from routers.transactions import router as transactions_router
from routers.alerts import router as alerts_router
# from routers.reports import router as reports_router  # Temporarily disabled due to matplotlib deps
from routers.documents import router as documents_router
from routers.energy_bills import router as energy_bills_router
from routers.water_bills import router as water_bills_router

logger = structlog.get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("Starting SISMOBI Backend v3.2.0")
    try:
        await connect_to_mongo()
        
        # Create default admin user if it doesn't exist
        try:
            db = get_database()
            existing_admin = await db.users.find_one({"email": "admin@sismobi.com"})
            if not existing_admin:
                await create_user(db, "admin@sismobi.com", "admin123456", "Admin User")
                logger.info("Default admin user created")
        except Exception as e:
            logger.warning("Could not create default admin user", error=str(e))
            
        logger.info("Backend started successfully")
        yield
        
    except Exception as e:
        logger.error("Failed to start backend", error=str(e))
        raise
    finally:
        # Shutdown
        logger.info("Shutting down SISMOBI Backend")
        await close_mongo_connection()

# Create FastAPI application
app = FastAPI(
    title="SISMOBI API",
    description="Sistema de Gestão Imobiliária - Backend API v3.2.0",
    version="3.2.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(properties_router, prefix=settings.api_prefix)
app.include_router(tenants_router, prefix=settings.api_prefix)
app.include_router(transactions_router, prefix=settings.api_prefix)
app.include_router(alerts_router, prefix=settings.api_prefix)
# app.include_router(reports_router, prefix=settings.api_prefix)  # Temporarily disabled due to matplotlib deps
app.include_router(documents_router, prefix=settings.api_prefix)
app.include_router(energy_bills_router, prefix=settings.api_prefix)
app.include_router(water_bills_router, prefix=settings.api_prefix)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SISMOBI API 3.2.0 is running", 
        "status": "active", 
        "timestamp": datetime.now().isoformat(),
        "documentation": "/docs"
    }

@app.get("/api/health", response_model=HealthResponse)
async def health_check(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Health check endpoint"""
    try:
        # Test database connection
        await db.command('ping')
        database_status = "connected"
    except Exception as e:
        logger.error("Database health check failed", error=str(e))
        database_status = "disconnected"
        
    return HealthResponse(
        status="healthy" if database_status == "connected" else "degraded",
        database_status=database_status
    )

@app.get("/api/v1/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get comprehensive dashboard summary"""
    try:
        summary_data = await calculate_dashboard_summary(db)
        logger.info("Dashboard summary retrieved", user=current_user.email)
        return DashboardSummary(**summary_data)
        
    except Exception as e:
        logger.error("Error retrieving dashboard summary", error=str(e), user=current_user.email)
        raise HTTPException(status_code=500, detail="Internal server error")

# Initialize endpoint for testing
@app.post("/api/v1/init", response_model=MessageResponse) 
async def initialize_system(
    current_user: User = Depends(get_current_active_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Initialize system with sample data (for testing)"""
    try:
        # Create sample properties
        sample_properties = [
            {
                "id": str(uuid.uuid4()),
                "name": "Apartamento Centro",
                "address": "Rua das Flores, 123 - Centro",
                "type": "Apartamento",
                "size": 75.0,
                "rooms": 2,
                "rent_value": 1500.0,
                "expenses": 200.0,
                "status": "vacant",
                "description": "Apartamento moderno no centro da cidade",
                "tenant_id": None,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Casa Jardim",
                "address": "Av. das Palmeiras, 456 - Jardim",
                "type": "Casa", 
                "size": 120.0,
                "rooms": 3,
                "rent_value": 2500.0,
                "expenses": 350.0,
                "status": "vacant",
                "description": "Casa espaçosa com quintal",
                "tenant_id": None,
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
        ]
        
        # Insert properties if they don't exist
        existing_properties = await db.properties.count_documents({})
        if existing_properties == 0:
            await db.properties.insert_many(sample_properties)
            logger.info("Sample properties created")
        
        return {"message": "System initialized successfully", "status": "success"}
        
    except Exception as e:
        logger.error("Error initializing system", error=str(e))
        raise HTTPException(status_code=500, detail="Failed to initialize system")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)