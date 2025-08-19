#!/usr/bin/env python3
"""
Simple SISMOBI server for validation testing
"""
from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)