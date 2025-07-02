#!/usr/bin/env python3
"""
Simple API test script for MealMate
"""
import requests
import json
import sys

BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Make sure the server is running.")
        return False

def test_api_docs():
    """Test the API documentation endpoint"""
    print("🔍 Testing API documentation...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API docs loaded: {data.get('name', 'Unknown')} v{data.get('version', 'Unknown')}")
            return True
        else:
            print(f"❌ API docs failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API docs error: {e}")
        return False

def test_ai_health():
    """Test the AI service health check"""
    print("🔍 Testing AI service health...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            data = response.json()
            status = "✅" if data.get('configured') else "⚠️"
            print(f"{status} AI service: {data.get('status', 'unknown')} (configured: {data.get('configured', False)})")
            return True
        else:
            print(f"❌ AI health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ AI health check error: {e}")
        return False

def test_user_registration():
    """Test user registration"""
    print("🔍 Testing user registration...")
    try:
        test_user = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            print("✅ User registration successful")
            return True
        elif response.status_code == 409:
            print("⚠️ User already exists (this is expected if test was run before)")
            return True
        else:
            print(f"❌ User registration failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ User registration error: {e}")
        return False

def test_user_login():
    """Test user login"""
    print("🔍 Testing user login...")
    try:
        test_user = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            if token:
                print("✅ User login successful")
                return token
            else:
                print("❌ No access token received")
                return None
        else:
            print(f"❌ User login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ User login error: {e}")
        return None

def test_authenticated_endpoints(token):
    """Test authenticated endpoints"""
    if not token:
        print("❌ No token available for authenticated tests")
        return False
    
    print("🔍 Testing authenticated endpoints...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test get profile
    try:
        response = requests.get(f"{BASE_URL}/api/auth/profile", headers=headers)
        if response.status_code == 200:
            print("✅ Profile endpoint working")
        else:
            print(f"❌ Profile endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Profile endpoint error: {e}")
    
    # Test get meal plan
    try:
        response = requests.get(f"{BASE_URL}/api/plan", headers=headers)
        if response.status_code == 200:
            print("✅ Meal plan endpoint working")
        else:
            print(f"❌ Meal plan endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Meal plan endpoint error: {e}")
    
    # Test get grocery list
    try:
        response = requests.get(f"{BASE_URL}/api/groceries", headers=headers)
        if response.status_code == 200:
            print("✅ Grocery list endpoint working")
        else:
            print(f"❌ Grocery list endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Grocery list endpoint error: {e}")
    
    return True

def main():
    """Run all tests"""
    print("🚀 Starting MealMate API Tests\n")
    
    tests = [
        ("Health Check", test_health_check),
        ("API Documentation", test_api_docs),
        ("AI Service Health", test_ai_health),
        ("User Registration", test_user_registration),
        ("User Login", test_user_login),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        if test_func():
            passed += 1
        print()
    
    # Test authenticated endpoints if login was successful
    token = None
    try:
        token = test_user_login()
        if token:
            print("--- Authenticated Endpoints ---")
            test_authenticated_endpoints(token)
            print()
    except:
        pass
    
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your API is working correctly.")
        return 0
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 