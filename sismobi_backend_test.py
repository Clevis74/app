#!/usr/bin/env python3
"""
SISMOBI Backend Test Suite - Focused on Mock Data Validation
Testing the button logic validation for tenant consumption buttons
"""

import sys
import json
import requests
from datetime import datetime
from typing import Dict, Any, List

class SISMOBITester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
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
        
        if method.upper() == "GET":
            return requests.get(url, headers=headers)
        elif method.upper() == "POST":
            if endpoint == "/api/v1/auth/login":
                # Login endpoint expects form data
                return requests.post(url, data=data, headers={"Content-Type": "application/x-www-form-urlencoded"})
            else:
                return requests.post(url, json=data, headers=headers)

    def test_health_check(self) -> bool:
        """Test health check endpoint"""
        try:
            response = self.make_request("GET", "/api/health")
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
            
            response = self.make_request("POST", "/api/v1/auth/login", data=login_data)
            print(f"  - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get('access_token')
                print(f"  - Token Type: {data.get('token_type')}")
                print(f"  - Access Token: {'*' * 20}...")
                return self.access_token is not None
            else:
                print(f"  - Error: {response.text}")
                return False
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_get_current_user(self) -> bool:
        """Test getting current user info"""
        try:
            response = self.make_request("GET", "/api/v1/auth/me")
            print(f"  - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  - User ID: {data.get('id')}")
                print(f"  - User Email: {data.get('email')}")
                print(f"  - User Name: {data.get('name')}")
                return data.get('email') == 'admin@sismobi.com'
            else:
                print(f"  - Error: {response.text}")
                return False
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_token_verification(self) -> bool:
        """Test token verification"""
        try:
            response = self.make_request("GET", "/api/v1/auth/verify")
            print(f"  - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  - Valid: {data.get('valid')}")
                print(f"  - User: {data.get('user', {}).get('name')}")
                return data.get('valid') == True
            else:
                print(f"  - Error: {response.text}")
                return False
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_get_tenants_mock_data(self) -> bool:
        """Test getting tenants and validate mock data structure"""
        try:
            response = self.make_request("GET", "/api/v1/tenants/")
            print(f"  - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                tenants = response.json()
                print(f"  - Total Tenants: {len(tenants)}")
                
                # Validate expected 6 tenants
                if len(tenants) != 6:
                    print(f"  - ERROR: Expected 6 tenants, got {len(tenants)}")
                    return False
                
                # Validate each tenant has required fields
                required_fields = ['id', 'name', 'cpf', 'status', 'propertyId']
                for i, tenant in enumerate(tenants):
                    print(f"  - Tenant {i+1}: {tenant.get('name')} - CPF: {tenant.get('cpf')} - Status: {tenant.get('status')} - Property: {tenant.get('propertyId')}")
                    
                    for field in required_fields:
                        if field not in tenant:
                            print(f"  - ERROR: Missing field '{field}' in tenant {tenant.get('name')}")
                            return False
                
                return True
            else:
                print(f"  - Error: {response.text}")
                return False
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_button_logic_validation(self) -> bool:
        """Test the specific button logic for each tenant"""
        try:
            response = self.make_request("GET", "/api/v1/tenants/")
            
            if response.status_code != 200:
                print(f"  - Error getting tenants: {response.text}")
                return False
            
            tenants = response.json()
            
            # Expected button visibility based on the logic:
            # - Status must be 'active'
            # - CPF must not be empty, not '000.000.000-00', and have 11 digits
            # - PropertyId must not be empty
            
            expected_results = {
                "João Silva (Válido)": True,  # active, valid CPF, has property
                "Maria Ficticia (CPF Inválido)": False,  # CPF is 000.000.000-00
                "Carlos Santos (Status Inativo)": False,  # status is inactive
                "Ana Oliveira (Sem Propriedade)": False,  # propertyId is empty
                "Pedro Mendes (CPF Curto)": False,  # CPF is too short
                "Luana Costa (Sem CPF)": False,  # CPF is empty
            }
            
            print(f"  - Validating button logic for {len(tenants)} tenants:")
            
            all_correct = True
            for tenant in tenants:
                name = tenant.get('name')
                status = tenant.get('status')
                cpf = tenant.get('cpf', '')
                property_id = tenant.get('propertyId', '')
                
                # Apply the same logic as in the frontend
                should_show_button = (
                    status == 'active' and
                    property_id != '' and
                    cpf != '' and
                    cpf != '000.000.000-00' and
                    len(cpf.replace('.', '').replace('-', '')) == 11
                )
                
                expected = expected_results.get(name, False)
                
                print(f"    • {name}")
                print(f"      - Status: {status} | CPF: {cpf} | Property: {property_id}")
                print(f"      - Should show button: {should_show_button} | Expected: {expected}")
                
                if should_show_button != expected:
                    print(f"      - ❌ MISMATCH! Logic result doesn't match expected")
                    all_correct = False
                else:
                    print(f"      - ✅ Correct")
            
            return all_correct
            
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_get_properties(self) -> bool:
        """Test getting properties mock data"""
        try:
            response = self.make_request("GET", "/api/v1/properties/")
            print(f"  - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                properties = response.json()
                print(f"  - Total Properties: {len(properties)}")
                
                # Validate expected 5 properties
                if len(properties) != 5:
                    print(f"  - ERROR: Expected 5 properties, got {len(properties)}")
                    return False
                
                # Show property details
                for i, prop in enumerate(properties):
                    print(f"  - Property {i+1}: {prop.get('name')} - ID: {prop.get('id')}")
                
                return True
            else:
                print(f"  - Error: {response.text}")
                return False
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_dashboard_summary(self) -> bool:
        """Test dashboard summary endpoint"""
        try:
            response = self.make_request("GET", "/api/v1/dashboard/summary")
            print(f"  - Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  - Total Properties: {data.get('totalProperties')}")
                print(f"  - Total Tenants: {data.get('totalTenants')}")
                print(f"  - Occupied Properties: {data.get('occupiedProperties')}")
                print(f"  - Vacant Properties: {data.get('vacantProperties')}")
                return True
            else:
                print(f"  - Error: {response.text}")
                return False
        except Exception as e:
            print(f"  - Exception: {str(e)}")
            return False

    def test_other_endpoints(self) -> bool:
        """Test other endpoints that should return empty arrays"""
        endpoints = [
            "/api/v1/transactions/",
            "/api/v1/alerts/",
            "/api/v1/energy-bills/",
            "/api/v1/water-bills/",
            "/api/v1/documents/"
        ]
        
        all_passed = True
        for endpoint in endpoints:
            try:
                response = self.make_request("GET", endpoint)
                print(f"  - {endpoint}: Status {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list) and len(data) == 0:
                        print(f"    ✅ Returns empty array as expected")
                    else:
                        print(f"    ⚠️  Returns: {data}")
                else:
                    print(f"    ❌ Error: {response.text}")
                    all_passed = False
            except Exception as e:
                print(f"    ❌ Exception: {str(e)}")
                all_passed = False
        
        return all_passed

def main():
    print("=== SISMOBI BACKEND TEST SUITE - BUTTON LOGIC VALIDATION ===")
    print(f"Test run at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("Testing Mock Data and Button Logic for Tenant Consumption Buttons")
    print("Backend URL: http://localhost:8001")
    
    tester = SISMOBITester()
    
    # Run focused backend tests
    tester.run_test("Health Check", tester.test_health_check)
    tester.run_test("Admin Login", tester.test_login)
    tester.run_test("Get Current User", tester.test_get_current_user)
    tester.run_test("Token Verification", tester.test_token_verification)
    tester.run_test("Get Tenants Mock Data", tester.test_get_tenants_mock_data)
    tester.run_test("Button Logic Validation", tester.test_button_logic_validation)
    tester.run_test("Get Properties Mock Data", tester.test_get_properties)
    tester.run_test("Dashboard Summary", tester.test_dashboard_summary)
    tester.run_test("Other Endpoints", tester.test_other_endpoints)
    
    # Print results
    print(f"\n📊 SISMOBI Backend Test Summary:")
    print(f"✅ Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    if tester.tests_passed == tester.tests_run:
        print(f"\n🎉 ALL BACKEND TESTS PASSED!")
        print(f"✨ Mock data is correct and button logic validation successful")
        print(f"🔘 Only 'João Silva (Válido)' should have consumption button visible")
        print(f"🚫 All other tenants should have buttons hidden with explanatory messages")
    else:
        print(f"\n⚠️  Some tests failed - Backend needs attention")
        failed_count = tester.tests_run - tester.tests_passed
        print(f"❌ {failed_count} test(s) failed")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())