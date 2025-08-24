#!/usr/bin/env python3
"""
SISMOBI Production Backend Test Suite
Testing against the public URL with proper API endpoints
"""

import sys
import json
import requests
from datetime import datetime
from typing import Dict, Any, List

class SISMOBIProductionTester:
    def __init__(self):
        # Get the public URL from frontend .env
        try:
            with open('/app/frontend/.env', 'r') as f:
                content = f.read()
                if 'REACT_APP_BACKEND_URL=/api' in content:
                    # This means the frontend uses /api which routes to the backend
                    # We need to use the actual public URL
                    self.base_url = "https://client-perspective.preview.emergentagent.com/api"
                else:
                    self.base_url = "https://client-perspective.preview.emergentagent.com/api"
        except:
            self.base_url = "https://client-perspective.preview.emergentagent.com/api"
            
        self.tests_run = 0
        self.tests_passed = 0
        self.access_token = None

    def run_test(self, name: str, test_func):
        """Run a single test"""
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            result = test_func()
            if result:
                self.tests_passed += 1
                print(f"✅ Passed")
            else:
                print(f"❌ Failed")
            return result
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False

    def make_request(self, method: str, endpoint: str, data: Dict[str, Any] = None, 
                    headers: Dict[str, str] = None) -> requests.Response:
        """Make HTTP request to API"""
        url = f"{self.base_url}{endpoint}"
        
        if headers is None:
            headers = {"Content-Type": "application/json"}
        
        if self.access_token and "Authorization" not in headers:
            headers["Authorization"] = f"Bearer {self.access_token}"
        
        print(f"  - Making {method} request to: {url}")
        
        if method.upper() == "GET":
            return requests.get(url, headers=headers, timeout=10)
        elif method.upper() == "POST":
            if endpoint == "/v1/auth/login":
                # Login endpoint expects form data
                return requests.post(url, data=data, headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=10)
            else:
                return requests.post(url, json=data, headers=headers, timeout=10)

    def test_health_check(self) -> bool:
        """Test health check endpoint"""
        try:
            response = self.make_request("GET", "/health")
            print(f"  - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  - Status: {data.get('status')}")
                print(f"  - Service: {data.get('service')}")
                print(f"  - Version: {data.get('version')}")
                return data.get('status') == 'healthy'
            else:
                print(f"  - Error: {response.text}")
                return False
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_login(self) -> bool:
        """Test login with admin credentials"""
        try:
            login_data = {
                "username": "admin@sismobi.com",
                "password": "admin123"
            }
            
            response = self.make_request("POST", "/v1/auth/login", data=login_data)
            print(f"  - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get('access_token')
                print(f"  - Token Type: {data.get('token_type')}")
                print(f"  - Access Token: {'*' * 20}...")
                return self.access_token is not None
            else:
                print(f"  - Error: {response.text}")
                # Try with admin123456
                login_data["password"] = "admin123456"
                response = self.make_request("POST", "/v1/auth/login", data=login_data)
                print(f"  - Retry Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    self.access_token = data.get('access_token')
                    print(f"  - Token Type: {data.get('token_type')}")
                    print(f"  - Access Token: {'*' * 20}...")
                    return self.access_token is not None
                else:
                    print(f"  - Retry Error: {response.text}")
                    return False
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_get_current_user(self) -> bool:
        """Test getting current user info"""
        try:
            response = self.make_request("GET", "/v1/auth/me")
            print(f"  - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  - User ID: {data.get('id')}")
                print(f"  - User Email: {data.get('email')}")
                print(f"  - Full Name: {data.get('full_name')}")
                return data.get('email') == 'admin@sismobi.com'
            else:
                print(f"  - Error: {response.text}")
                return False
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_get_tenants(self) -> bool:
        """Test getting tenants mock data"""
        try:
            response = self.make_request("GET", "/v1/tenants/")
            print(f"  - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                tenants = response.json()
                print(f"  - Total Tenants: {len(tenants)}")
                
                # Show tenant details
                for i, tenant in enumerate(tenants):
                    print(f"  - Tenant {i+1}: {tenant.get('name')} - CPF: {tenant.get('cpf')} - Status: {tenant.get('status')} - Property: {tenant.get('propertyId')}")
                
                return len(tenants) == 6
            else:
                print(f"  - Error: {response.text}")
                return False
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_get_properties(self) -> bool:
        """Test getting properties mock data"""
        try:
            response = self.make_request("GET", "/v1/properties/")
            print(f"  - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                properties = response.json()
                print(f"  - Total Properties: {len(properties)}")
                
                # Show property details
                for i, prop in enumerate(properties):
                    print(f"  - Property {i+1}: {prop.get('name')} - ID: {prop.get('id')} - Status: {prop.get('status')}")
                
                return len(properties) == 2
            else:
                print(f"  - Error: {response.text}")
                return False
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_dashboard_summary(self) -> bool:
        """Test dashboard summary endpoint"""
        try:
            response = self.make_request("GET", "/v1/dashboard/summary")
            print(f"  - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  - Total Properties: {data.get('total_properties')}")
                print(f"  - Total Tenants: {data.get('total_tenants')}")
                print(f"  - Occupied Properties: {data.get('occupied_properties')}")
                print(f"  - Vacant Properties: {data.get('vacant_properties')}")
                print(f"  - Monthly Income: {data.get('total_monthly_income')}")
                print(f"  - Monthly Expenses: {data.get('total_monthly_expenses')}")
                print(f"  - Pending Alerts: {data.get('pending_alerts')}")
                return True
            else:
                print(f"  - Error: {response.text}")
                return False
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_other_endpoints(self) -> bool:
        """Test other endpoints that should return empty data"""
        endpoints = [
            "/v1/transactions/",
            "/v1/alerts/",
            "/v1/energy-bills/",
            "/v1/water-bills/",
            "/v1/documents/"
        ]
        
        all_passed = True
        for endpoint in endpoints:
            try:
                response = self.make_request("GET", endpoint)
                print(f"  - {endpoint}: Status {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"    ✅ Returns: {data}")
                else:
                    print(f"    ❌ Error: {response.text}")
                    all_passed = False
            except Exception as e:
                print(f"    ❌ Exception: {str(e)}")
                all_passed = False
        
        return all_passed

def main():
    print("=== SISMOBI PRODUCTION BACKEND TEST SUITE ===")
    print(f"Test run at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Testing Production Backend APIs")
    
    tester = SISMOBIProductionTester()
    print(f"Backend URL: {tester.base_url}")
    
    # Run backend tests
    tester.run_test("Health Check", tester.test_health_check)
    tester.run_test("Admin Login", tester.test_login)
    tester.run_test("Get Current User", tester.test_get_current_user)
    tester.run_test("Get Tenants", tester.test_get_tenants)
    tester.run_test("Get Properties", tester.test_get_properties)
    tester.run_test("Dashboard Summary", tester.test_dashboard_summary)
    tester.run_test("Other Endpoints", tester.test_other_endpoints)
    
    # Print results
    print(f"\n📊 SISMOBI Production Backend Test Summary:")
    print(f"✅ Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    if tester.tests_passed == tester.tests_run:
        print(f"\n🎉 ALL BACKEND TESTS PASSED!")
        print(f"✨ Backend APIs are working correctly")
    else:
        print(f"\n⚠️  Some tests failed - Backend needs attention")
        failed_count = tester.tests_run - tester.tests_passed
        print(f"❌ {failed_count} test(s) failed")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())