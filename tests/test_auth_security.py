import requests
import sys

# Configuration
BASE_URL = "http://127.0.0.1:8000/api/v1"
LOGIN_URL = f"{BASE_URL}/auth/login"
ME_URL = f"{BASE_URL}/auth/me"
LOGOUT_URL = f"{BASE_URL}/auth/logout"

# Test Credentials
EMAIL = "salvador.admin@gmail.com"
PASSWORD = "Dilio1515**"

def test_secure_auth_flow():
    print(f"🔒 Testing Security Auth Flow on {BASE_URL}...\n")

    # 1. Test Login & Cookie Setting
    print("1. Attempting Login...")
    session = requests.Session()
    try:
        response = session.post(LOGIN_URL, json={"email": EMAIL, "password": PASSWORD})
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to backend. Is it running on port 8000?")
        sys.exit(1)

    if response.status_code != 200:
        print(f"❌ Login failed! Status: {response.status_code}")
        print(f"Response: {response.text}")
        sys.exit(1)
    
    # Check Cookie
    cookies = session.cookies.get_dict()
    access_token_cookie = None
    for cookie in session.cookies:
        if cookie.name == "access_token":
            access_token_cookie = cookie
            break
    
    if not access_token_cookie:
        print("❌ FAILED: 'access_token' cookie not found in response!")
        sys.exit(1)
    
    print("✅ Login Successful.")
    print(f"   - Cookie found: {access_token_cookie.name}")
    print(f"   - HttpOnly: {access_token_cookie.has_nonstandard_attr('HttpOnly') or access_token_cookie.rest.get('HttpOnly') is not None}")
    # Note: requests cookie jar handling varies for flags, manual inspection might be needed if this check fails falsely.
    
    # 2. Test Access Protected Route (Me) using Cookie
    print("\n2. Testing Access to Protected Route (/me) via Cookie...")
    # Clear headers to ensure we aren't sending Authorization header (requests doesn't by default unless set)
    session.headers.pop("Authorization", None)
    
    me_response = session.post(ME_URL)
    if me_response.status_code == 200:
        print(f"✅ Access Granted! User: {me_response.json().get('email')}")
    else:
        print(f"❌ Access Denied! Status: {me_response.status_code}")
        print(f"Response: {me_response.text}")
        sys.exit(1)

    # 3. Test Logout
    print("\n3. Testing Logout...")
    logout_response = session.post(LOGOUT_URL)
    if logout_response.status_code == 200:
        print("✅ Logout endpoint returned 200.")
    else:
        print(f"❌ Logout failed. Status: {logout_response.status_code}")

    # Verify cookie is cleared/expired
    # Usually logout sets max-age=0 or similar.
    # We can test by trying to access /me again.
    
    print("\n4. Verifying Access Denied after Logout...")
    me_response_after = session.post(ME_URL)
    if me_response_after.status_code == 401 or me_response_after.status_code == 403:
         print("✅ Access Denied as expected.")
    else:
         print(f"❌ Failed! Still accessible after logout. Status: {me_response_after.status_code}")
         print(me_response_after.text)
         sys.exit(1)

    print("\n🎉 SECURITY VERIFICATION PASSED!")

if __name__ == "__main__":
    test_secure_auth_flow()
