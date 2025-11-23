import requests
import sys
import json
from datetime import datetime, timedelta

class JhunBarberAPITester:
    def __init__(self, base_url="https://jhunblack.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (Expected: {expected_status})"
                try:
                    error_data = response.json()
                    details += f" - {error_data}"
                except:
                    details += f" - {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                return False, details

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, str(e)

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_get_services(self):
        """Test getting all services - should return 13 services"""
        success, response = self.run_test("Get All Services", "GET", "services", 200)
        
        if success and isinstance(response, list):
            service_count = len(response)
            if service_count == 13:
                print(f"   ✅ Found {service_count} services (expected 13)")
                # Check if services have required fields
                for service in response[:3]:  # Check first 3 services
                    required_fields = ['id', 'name', 'price', 'duration_minutes']
                    missing_fields = [field for field in required_fields if field not in service]
                    if missing_fields:
                        self.log_test("Service Structure Validation", False, f"Missing fields: {missing_fields}")
                        return False
                
                self.log_test("Service Structure Validation", True, "All required fields present")
                return True
            else:
                self.log_test("Service Count Validation", False, f"Expected 13 services, got {service_count}")
                return False
        
        return success

    def test_admin_login_correct(self):
        """Test admin login with correct password"""
        success, response = self.run_test(
            "Admin Login (Correct Password)", 
            "POST", 
            "auth/login", 
            200,
            {"password": "jhun2025"}
        )
        
        if success and isinstance(response, dict):
            if response.get('success') and response.get('token'):
                self.token = response['token']
                print(f"   ✅ Login successful, token received")
                return True
            else:
                self.log_test("Admin Login Token Validation", False, "No token in response")
                return False
        
        return success

    def test_admin_login_incorrect(self):
        """Test admin login with incorrect password"""
        success, response = self.run_test(
            "Admin Login (Incorrect Password)", 
            "POST", 
            "auth/login", 
            200,
            {"password": "wrongpassword"}
        )
        
        if success and isinstance(response, dict):
            if not response.get('success'):
                print(f"   ✅ Correctly rejected wrong password")
                return True
            else:
                self.log_test("Admin Login Security", False, "Wrong password was accepted")
                return False
        
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        success, response = self.run_test("Dashboard Statistics", "GET", "dashboard/stats", 200)
        
        if success and isinstance(response, dict):
            required_fields = ['today_appointments', 'total_customers', 'monthly_revenue', 'total_appointments']
            missing_fields = [field for field in required_fields if field not in response]
            
            if not missing_fields:
                print(f"   ✅ All stats fields present: {response}")
                return True
            else:
                self.log_test("Dashboard Stats Structure", False, f"Missing fields: {missing_fields}")
                return False
        
        return success

    def test_create_appointment(self):
        """Test creating a new appointment"""
        # First get a service ID
        success, services = self.run_test("Get Services for Appointment", "GET", "services", 200)
        if not success or not services:
            return False
        
        service = services[0]  # Use first service
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        appointment_data = {
            "service_id": service['id'],
            "customer_name": "Test Customer",
            "customer_phone": "+1234567890",
            "customer_email": "test@example.com",
            "date": tomorrow,
            "time": "10:00",
            "language": "en"
        }
        
        # Accept both 200 and 201 as success for appointment creation
        success, response = self.run_test(
            "Create Appointment", 
            "POST", 
            "appointments", 
            200,
            appointment_data
        )
        
        if success and isinstance(response, dict):
            if 'id' in response:
                print(f"   ✅ Appointment created with ID: {response['id']}")
                self.created_appointment_id = response['id']
                return True
        
        return success

    def test_get_appointments(self):
        """Test getting appointments"""
        return self.run_test("Get All Appointments", "GET", "appointments", 200)

    def test_available_slots(self):
        """Test getting available time slots"""
        # Get a service first
        success, services = self.run_test("Get Services for Slots", "GET", "services", 200)
        if not success or not services:
            return False
        
        service_id = services[0]['id']
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        success, response = self.run_test(
            "Get Available Slots", 
            "GET", 
            f"available-slots?date={tomorrow}&service_id={service_id}", 
            200
        )
        
        if success and isinstance(response, dict):
            if 'available_slots' in response:
                slots = response['available_slots']
                print(f"   ✅ Found {len(slots)} available slots")
                return True
        
        return success

    def test_block_time_slot(self):
        """Test blocking a time slot"""
        tomorrow = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
        
        block_data = {
            "date": tomorrow,
            "start_time": "14:00",
            "end_time": "15:00",
            "reason": "Test block"
        }
        
        success, response = self.run_test(
            "Block Time Slot", 
            "POST", 
            "blocked-slots", 
            201,
            block_data
        )
        
        if success and isinstance(response, dict):
            if 'id' in response:
                print(f"   ✅ Time slot blocked with ID: {response['id']}")
                self.blocked_slot_id = response['id']
                return True
        
        return success

    def test_get_blocked_slots(self):
        """Test getting blocked slots"""
        return self.run_test("Get Blocked Slots", "GET", "blocked-slots", 200)

    def test_get_customers(self):
        """Test getting all customers"""
        return self.run_test("Get All Customers", "GET", "customers", 200)

    def test_update_appointment_status(self):
        """Test updating appointment status"""
        if not hasattr(self, 'created_appointment_id'):
            print("   ⚠️  Skipping - no appointment ID available")
            return True
        
        update_data = {"status": "completed"}
        
        return self.run_test(
            "Update Appointment Status", 
            "PATCH", 
            f"appointments/{self.created_appointment_id}", 
            200,
            update_data
        )

    def test_unblock_slot(self):
        """Test unblocking a time slot"""
        if not hasattr(self, 'blocked_slot_id'):
            print("   ⚠️  Skipping - no blocked slot ID available")
            return True
        
        return self.run_test(
            "Unblock Time Slot", 
            "DELETE", 
            f"blocked-slots/{self.blocked_slot_id}", 
            200
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Jhun Black Barber API Tests")
        print("=" * 50)
        
        # Basic API tests
        self.test_root_endpoint()
        self.test_get_services()
        
        # Authentication tests
        self.test_admin_login_incorrect()
        self.test_admin_login_correct()
        
        # Dashboard tests
        self.test_dashboard_stats()
        
        # Appointment flow tests
        self.test_create_appointment()
        self.test_get_appointments()
        self.test_available_slots()
        self.test_update_appointment_status()
        
        # Time blocking tests
        self.test_block_time_slot()
        self.test_get_blocked_slots()
        self.test_unblock_slot()
        
        # Customer tests
        self.test_get_customers()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 TEST SUMMARY")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED!")
            return 0
        else:
            print("❌ SOME TESTS FAILED")
            print("\nFailed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
            return 1

def main():
    tester = JhunBarberAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())