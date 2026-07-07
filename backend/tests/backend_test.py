"""RideX backend API tests"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://8150c96b-0fd6-4497-a60d-7aa943c85b1b.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@ridex.com"
ADMIN_PASSWORD = "admin123"
USER_EMAIL = "ramu@example.com"
USER_PASSWORD = "test123"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _login(session, email, password):
    r = session.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    return data.get("token"), data.get("user")


@pytest.fixture(scope="session")
def admin_token(session):
    tok, user = _login(session, ADMIN_EMAIL, ADMIN_PASSWORD)
    assert user.get("role") == "admin"
    return tok


@pytest.fixture(scope="session")
def user_token(session):
    tok, _ = _login(session, USER_EMAIL, USER_PASSWORD)
    return tok


# ------------ Health ------------
def test_health(session):
    r = session.get(f"{API}/health", timeout=10)
    assert r.status_code == 200


# ------------ Vehicles ------------
def test_get_vehicles(session):
    r = session.get(f"{API}/vehicles", timeout=15)
    assert r.status_code == 200
    data = r.json()
    vehicles = data if isinstance(data, list) else data.get("vehicles", data.get("data", []))
    assert isinstance(vehicles, list)
    assert len(vehicles) >= 16, f"expected 16 vehicles, got {len(vehicles)}"


def test_get_vehicles_filter_bike(session):
    r = session.get(f"{API}/vehicles?type=bike", timeout=15)
    assert r.status_code == 200
    data = r.json()
    vehicles = data if isinstance(data, list) else data.get("vehicles", data.get("data", []))
    assert len(vehicles) > 0
    for v in vehicles:
        assert v.get("type") == "bike"


# ------------ Auth ------------
def test_admin_login(session):
    tok, user = _login(session, ADMIN_EMAIL, ADMIN_PASSWORD)
    assert tok and user["role"] == "admin"


def test_user_login(session):
    tok, user = _login(session, USER_EMAIL, USER_PASSWORD)
    assert tok and user["email"] == USER_EMAIL


def test_register_new_user(session):
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = session.post(f"{API}/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": "pass1234",
        "phone": "9999999999"
    }, timeout=15)
    assert r.status_code in (200, 201), r.text
    data = r.json()
    assert "token" in data
    assert data["user"]["email"] == email


def test_auth_me(session, user_token):
    r = session.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {user_token}"}, timeout=10)
    assert r.status_code == 200
    assert r.json().get("user", r.json()).get("email") in (USER_EMAIL,) or r.json().get("email") == USER_EMAIL


# ------------ Bookings & Payment ------------
@pytest.fixture(scope="session")
def available_vehicle(session):
    r = session.get(f"{API}/vehicles", timeout=15)
    data = r.json()
    vehicles = data if isinstance(data, list) else data.get("vehicles", data.get("data", []))
    for v in vehicles:
        if v.get("available"):
            return v
    pytest.skip("No available vehicle")


def test_booking_flow_and_coupon(session, user_token, available_vehicle):
    vehicle_id = available_vehicle.get("_id") or available_vehicle.get("id")
    headers = {"Authorization": f"Bearer {user_token}"}
    payload = {
        "vehicleId": vehicle_id,
        "pickupLocation": "Bengaluru",
        "dropoffLocation": "Mysuru",
        "startDate": "2026-02-01",
        "endDate": "2026-02-02",
        "couponCode": "RIDE10"
    }
    r = session.post(f"{API}/bookings", json=payload, headers=headers, timeout=15)
    assert r.status_code in (200, 201), r.text
    booking = r.json().get("booking", r.json())
    assert booking.get("_id") or booking.get("id")
    # verify coupon: totalAmount < base price (1 day * pricePerDay)
    price = available_vehicle.get("pricePerDay", 0)
    total = booking.get("totalAmount", 0)
    assert total < price + 1, f"coupon not applied: total {total} vs {price}"

    # vehicle should now be unavailable
    r2 = session.get(f"{API}/vehicles/{vehicle_id}", timeout=10)
    if r2.status_code == 200:
        v = r2.json().get("vehicle", r2.json())
        assert v.get("available") is False, "vehicle should be unavailable after booking"

    # payment initiate + verify
    booking_id = booking.get("_id") or booking.get("id")
    pi = session.post(f"{API}/payments/initiate", json={"bookingId": booking_id, "method": "upi"}, headers=headers, timeout=10)
    assert pi.status_code in (200, 201), pi.text
    pv = session.post(f"{API}/payments/verify", json={"bookingId": booking_id, "paymentId": pi.json().get("paymentId", "mock")}, headers=headers, timeout=10)
    assert pv.status_code in (200, 201), pv.text

    # cancel booking → should refund and free vehicle
    cancel = session.put(f"{API}/bookings/{booking_id}/cancel", headers=headers, timeout=10)
    assert cancel.status_code in (200, 201), cancel.text
    r3 = session.get(f"{API}/vehicles/{vehicle_id}", timeout=10)
    if r3.status_code == 200:
        v = r3.json().get("vehicle", r3.json())
        assert v.get("available") is True, "vehicle should be available after cancel"


def test_get_user_bookings(session, user_token):
    r = session.get(f"{API}/bookings", headers={"Authorization": f"Bearer {user_token}"}, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list) or "bookings" in data


# ------------ Admin ------------
def test_admin_stats(session, admin_token):
    r = session.get(f"{API}/admin/stats", headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
    assert r.status_code == 200
    d = r.json()
    for key in ("totalUsers", "totalVehicles", "totalBookings", "totalRevenue"):
        assert key in d, f"missing {key} in stats: {d}"


def test_admin_bookings(session, admin_token):
    r = session.get(f"{API}/admin/bookings", headers={"Authorization": f"Bearer {admin_token}"}, timeout=15)
    assert r.status_code == 200


def test_non_admin_forbidden(session, user_token):
    r = session.get(f"{API}/admin/stats", headers={"Authorization": f"Bearer {user_token}"}, timeout=10)
    assert r.status_code == 403


def test_admin_vehicle_crud(session, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "name": f"TEST_Bike_{uuid.uuid4().hex[:6]}",
        "type": "bike",
        "brand": "TestBrand",
        "model": "T100",
        "pricePerDay": 500,
        "image": "https://example.com/x.jpg",
        "description": "test",
        "location": "BLR",
        "fuelType": "petrol",
        "transmission": "manual",
        "seats": 2,
        "available": True
    }
    r = session.post(f"{API}/vehicles", json=payload, headers=headers, timeout=15)
    assert r.status_code in (200, 201), r.text
    vehicle = r.json().get("vehicle", r.json())
    vid = vehicle.get("_id") or vehicle.get("id")
    assert vid

    up = session.put(f"{API}/vehicles/{vid}", json={"pricePerDay": 600}, headers=headers, timeout=15)
    assert up.status_code in (200, 201), up.text

    dl = session.delete(f"{API}/vehicles/{vid}", headers=headers, timeout=15)
    assert dl.status_code in (200, 204), dl.text


def test_contact(session, admin_token):
    r = session.post(f"{API}/contact", json={
        "name": "T", "email": "t@t.com", "subject": "s", "message": "hi"
    }, timeout=10)
    assert r.status_code in (200, 201), r.text
    r2 = session.get(f"{API}/contact", headers={"Authorization": f"Bearer {admin_token}"}, timeout=10)
    assert r2.status_code == 200
