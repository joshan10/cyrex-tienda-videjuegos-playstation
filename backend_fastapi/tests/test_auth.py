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


def two_step_login(client, email, password):
    verify_response = client.post("/api/auth/verify-email", json={"correo": email})
    assert verify_response.status_code == 200
    token = verify_response.json()["token"]

    login_response = client.post("/api/auth/login", json={"token": token, "password": password})
    return login_response


def test_forgot_password(client, db):
    setup_db(db)
    response = client.post("/api/auth/forgot-password", json={"correo": "test@cyrex.com"})
    assert response.status_code == 200
    assert "dev_token" in response.json()

    token = response.json()["dev_token"]

    reset_response = client.post("/api/auth/reset-password", json={
        "token": token,
        "password": "newpassword123"
    })
    assert reset_response.status_code == 200
    assert reset_response.json()["message"] == "Contraseña actualizada exitosamente."

    login_response = two_step_login(client, "test@cyrex.com", "newpassword123")
    assert login_response.status_code == 200


def test_verify_email_exitoso(client, db):
    setup_db(db)
    response = client.post("/api/auth/verify-email", json={"correo": "test@cyrex.com"})
    assert response.status_code == 200
    assert response.json()["verified"] is True
    assert "token" in response.json()


def test_verify_email_no_registrado(client, db):
    setup_db(db)
    response = client.post("/api/auth/verify-email", json={"correo": "noexiste@test.com"})
    assert response.status_code == 200
    assert response.json()["verified"] is False


def test_login_credenciales_incorrectas(client, db):
    setup_db(db)
    login_response = two_step_login(client, "test@cyrex.com", "wrong")
    assert login_response.status_code == 401


def test_login_usuario_inexistente(client, db):
    setup_db(db)
    response = client.post("/api/auth/verify-email", json={"correo": "noexiste@test.com"})
    assert response.status_code == 200
    assert response.json()["verified"] is False


def test_registro_correo_duplicado(client, db):
    setup_db(db)
    response = client.post("/api/auth/register", json={
        "nombre": "Test",
        "apellido": "User",
        "tipo_documento": "cc",
        "numero_documento": "999999999",
        "direccion": "Calle Test 456",
        "telefono": "3001234567",
        "correo": "test@cyrex.com",
        "password": "password123",
    })
    assert response.status_code == 409


def test_registro_documento_duplicado(client, db):
    setup_db(db)
    response = client.post("/api/auth/register", json={
        "nombre": "Test",
        "apellido": "User",
        "tipo_documento": "cc",
        "numero_documento": "123456789",
        "direccion": "Calle Test 456",
        "telefono": "3001234567",
        "correo": "otro@cyrex.com",
        "password": "password123",
    })
    assert response.status_code == 409


def test_reset_password_token_invalido(client, db):
    setup_db(db)
    response = client.post("/api/auth/reset-password", json={"token": "token_inexistente", "password": "newpassword123"})
    assert response.status_code == 400


def test_perfil_usuario_autenticado(client, db):
    setup_db(db)
    login_response = two_step_login(client, "test@cyrex.com", "password123")
    token = login_response.json()["token"]
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["user"]["correo"] == "test@cyrex.com"


def test_perfil_sin_token(client, db):
    setup_db(db)
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_registro_devuelve_datos_completos_del_usuario(client, db):
    setup_db(db)
    response = client.post("/api/auth/register", json={
        "nombre": "Nuevo",
        "apellido": "Usuario",
        "tipo_documento": "cc",
        "numero_documento": "555555555",
        "direccion": "Avenida Nueva 456",
        "telefono": "3005556677",
        "correo": "nuevo@test.com",
        "password": "password123",
    })
    assert response.status_code == 201
    user = response.json()["user"]
    assert user["direccion"] == "Avenida Nueva 456"
    assert user["telefono"] == "3005556677"
    assert user["tipo_documento"] == "cc"
    assert user["estado"] == "activo"
    assert user["rol"] == "Cliente"
    assert "permisos" in user
    assert "password" not in user


def test_login_token_expirado(client, db):
    setup_db(db)
    from datetime import datetime, timedelta, timezone
    from app.models.entities import EmailVerificationToken

    verify_response = client.post("/api/auth/verify-email", json={"correo": "test@cyrex.com"})
    token_value = verify_response.json()["token"]

    expired_token = EmailVerificationToken(
        correo="test@cyrex.com",
        token=token_value + "_expired",
        expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        used=False,
        created_at=datetime.now(timezone.utc),
    )
    db.add(expired_token)
    db.commit()

    response = client.post("/api/auth/login", json={
        "token": token_value + "_expired",
        "password": "password123"
    })
    assert response.status_code == 401


def test_login_token_ya_usado(client, db):
    setup_db(db)
    from sqlalchemy import select
    from app.models.entities import EmailVerificationToken

    verify_response = client.post("/api/auth/verify-email", json={"correo": "test@cyrex.com"})
    token_value = verify_response.json()["token"]

    verification = db.scalar(
        select(EmailVerificationToken).where(EmailVerificationToken.token == token_value)
    )
    verification.used = True
    db.commit()

    response = client.post("/api/auth/login", json={
        "token": token_value,
        "password": "password123"
    })
    assert response.status_code == 401
