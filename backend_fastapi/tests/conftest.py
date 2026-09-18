import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.entities import Usuario
from app.models.roles import Rol


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.pop(get_db, None)


@pytest.fixture
def admin_user(db):
    db.add(Rol(id=1, nombre="Administrador"))
    user = Usuario(
        nombre="Admin",
        apellido="Test",
        tipo_documento="cc",
        numero_documento="100000001",
        direccion="Calle Admin 123",
        telefono="3000000001",
        correo="admin@test.com",
        password=hash_password("Admin1234!"),
        rol_id=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def employee_user(db):
    db.add(Rol(id=2, nombre="Empleado"))
    user = Usuario(
        nombre="Empleado",
        apellido="Test",
        tipo_documento="cc",
        numero_documento="100000004",
        direccion="Calle Empleado 456",
        telefono="3000000004",
        correo="empleado@test.com",
        password=hash_password("Empleado1234!"),
        rol_id=2,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def customer_user(db):
    db.add(Rol(id=3, nombre="Cliente"))
    user = Usuario(
        nombre="Cliente",
        apellido="Test",
        tipo_documento="cc",
        numero_documento="100000002",
        direccion="Calle Cliente 456",
        telefono="3000000002",
        correo="cliente@test.com",
        password=hash_password("Cliente1234!"),
        rol_id=3,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_headers(client, email, password):
    verify_response = client.post("/api/auth/verify-email", json={"correo": email})
    assert verify_response.status_code == 200
    token = verify_response.json()["token"]

    response = client.post("/api/auth/login", json={"token": token, "password": password})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['token']}"}
