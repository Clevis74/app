#!/usr/bin/env python3
"""
SISMOBI Backend 3.2.0 - Minimal Server for Testing
"""
import json
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# Mock data
MOCK_TENANTS = [
    {
        "id": "tenant-1",
        "name": "João Silva (Demo)",
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
        "name": "Maria Ficticia (Demo)",
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
        "name": "Carlos Santos (Demo)",
        "email": "carlos.santos@email.com", 
        "phone": "(11) 99999-3333",
        "cpf": "987.654.321-09",
        "status": "active",
        "propertyId": "property-3",
        "startDate": "2024-03-01",
        "monthlyRent": 1800,
        "deposit": 3600,
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

class APIHandler(http.server.BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        if path == '/api/health':
            response = {
                "status": "healthy",
                "service": "SISMOBI Minimal Backend",
                "version": "3.2.0",
                "timestamp": datetime.now().isoformat()
            }
        elif path == '/api/v1/tenants/':
            response = MOCK_TENANTS
        elif path == '/api/v1/properties/':
            response = MOCK_PROPERTIES
        elif path == '/api/v1/auth/verify':
            response = {"valid": True, "user": {"id": "admin", "email": "admin@sismobi.com"}}
        elif path == '/api/v1/dashboard/summary':
            response = {
                "totalProperties": len(MOCK_PROPERTIES),
                "totalTenants": len(MOCK_TENANTS),
                "occupiedProperties": 2,
                "vacantProperties": 0,
                "monthlyIncome": 4500.0,
                "monthlyExpenses": 0.0,
                "pendingAlerts": 0
            }
        else:
            response = {"message": "Endpoint not found", "path": path}
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        if path == '/api/v1/auth/login':
            # Simple mock login
            response = {
                "access_token": "test-token-123",
                "token_type": "bearer"
            }
        else:
            response = {"message": "POST endpoint not found", "path": path}
        
        self.wfile.write(json.dumps(response).encode())

if __name__ == "__main__":
    PORT = 8002  # Usando porta diferente
    with socketserver.TCPServer(("", PORT), APIHandler) as httpd:
        print(f"SISMOBI Minimal Backend running on port {PORT}")
        httpd.serve_forever()