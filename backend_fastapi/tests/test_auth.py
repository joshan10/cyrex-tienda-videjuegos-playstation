import pytest
from app.models.entities import Usuario
from app.models.roles import Rol
from app.core.security import hash_password

def setup_db(db):
    rol = Rol(id=3, nombre="Cliente")
    db.add(rol)
    user = Usuario(
        id=1, nombre="Test", apellido="User", tipo_documento="cc",
        numero_documento="123456789", direccion="Calle Falsa 123",
        telefono="3000000000", correo="test@cyrex.com",
        password=hash_password("password123"), rol_id=3
    )
    db.add(user)
    db.commit()

def test_forgot_password(client, db):
    setup_db(db)
    response = client.post("/api/auth/forgot-password", json={"correo": "test@cyrex.com"})
    assert response.status_code == 200
    assert "dev_token" in response.json()
    
    token = response.json()["dev_token"]
    
    # Test Reset
    reset_response = client.post("/api/auth/reset-password", json={
        "token": token,
        "password": "newpassword123"
    })
    assert reset_response.status_code == 200
    assert reset_response.json()["message"] == "Contraseña actualizada exitosamente."
    
    # Verify login with new password works
    login_response = client.post("/api/auth/login", json={
        "correo": "test@cyrex.com",
        "password": "newpassword123"
    })
    assert login_response.status_code == 200
