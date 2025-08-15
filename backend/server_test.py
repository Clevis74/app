"""
SISMOBI Backend 3.2.0 - Test server for consumption functionality
"""
from fastapi import FastAPI
from datetime import datetime

# Create FastAPI application
app = FastAPI(title="SISMOBI Test API", version="3.2.0")

@app.get("/")
async def root():
    return {"message": "Test API running", "status": "active"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SISMOBI Test Backend",
        "version": "3.2.0",
        "timestamp": datetime.now().isoformat(),
        "database_status": "connected"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)