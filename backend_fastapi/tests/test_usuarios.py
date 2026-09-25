from .conftest import login_headers


def test_usuarios_get_post_put_delete(client, admin_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")

    response = client.get("/api/usuarios", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()["items"]) == 1

    response = client.post(
        "/api/usuarios",
        headers=admin_headers,
        json={
            "nombre": "Nuevo",
            "apellido": "Usuario",
            "tipo_documento": "cc",
            "numero_documento": "100000003",
            "direccion": "Calle Nueva 789",
            "telefono": "3000000003",
            "correo": "nuevo@test.com",
            "password": "Nuevo1234!",
        },
    )
    assert response.status_code == 201
    user_id = response.json()["id"]

    response = client.put(
        f"/api/usuarios/{user_id}",
        headers=admin_headers,
        json={"nombre": "Usuario Actualizado", "telefono": "3000000099"},
    )
    assert response.status_code == 200
    assert response.json()["nombre"] == "Usuario Actualizado"

    response = client.delete(f"/api/usuarios/{user_id}", headers=admin_headers)
    assert response.status_code == 204


def test_usuario_no_encontrado(client, admin_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    response = client.get("/api/usuarios/9999", headers=admin_headers)
    assert response.status_code == 404


def test_usuarios_busqueda_y_paginacion(client, admin_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    client.post(
        "/api/usuarios",
        headers=admin_headers,
        json={
            "nombre": "Buscame",
            "apellido": "PorNombre",
            "tipo_documento": "cc",
            "numero_documento": "100000010",
            "direccion": "Calle Busqueda 1",
            "telefono": "3000000010",
            "correo": "busqueda@test.com",
            "password": "Busqueda1234!",
        },
    )

    response = client.get("/api/usuarios?search=Buscame", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["nombre"] == "Buscame"

    response = client.get("/api/usuarios?search=PorCorreoInexistente", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["total"] == 0
    assert response.json()["items"] == []

    response = client.get("/api/usuarios?page=1&size=1", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["size"] == 1
    assert data["total"] >= 2
    assert data["pages"] == data["total"]


def test_usuario_correo_duplicado(client, admin_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    client.post(
        "/api/usuarios",
        headers=admin_headers,
        json={
            "nombre": "Test",
            "apellido": "Duplicado",
            "tipo_documento": "cc",
            "numero_documento": "111111111",
            "direccion": "Calle Duplicado 123",
            "telefono": "3000000011",
            "correo": "duplicado@test.com",
            "password": "Test1234!",
        },
    )
    response = client.post(
        "/api/usuarios",
        headers=admin_headers,
        json={
            "nombre": "Test",
            "apellido": "Duplicado",
            "tipo_documento": "cc",
            "numero_documento": "222222222",
            "direccion": "Calle Duplicado 456",
            "telefono": "3000000022",
            "correo": "duplicado@test.com",
            "password": "Test1234!",
        },
    )
    assert response.status_code == 409


def test_usuario_requiere_admin(client, customer_user):
    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    response = client.get("/api/usuarios", headers=customer_headers)
    assert response.status_code == 403


def test_cliente_actualiza_su_propio_perfil(client, customer_user):
    headers = login_headers(client, customer_user.correo, "Cliente1234!")
    response = client.put(
        "/api/auth/me",
        headers=headers,
        json={
            "nombre": "Cliente Nuevo",
            "apellido": "Apellido Nuevo",
            "direccion": "Carrera 1 # 2-34, Bogota",
            "telefono": "3112223344",
        },
    )
    assert response.status_code == 200
    user = response.json()["user"]
    assert user["nombre"] == "Cliente Nuevo"
    assert user["direccion"] == "Carrera 1 # 2-34, Bogota"
    assert user["telefono"] == "3112223344"

    perfil = client.get("/api/auth/me", headers=headers)
    assert perfil.status_code == 200
    assert perfil.json()["user"]["nombre"] == "Cliente Nuevo"


def test_empleado_actualiza_su_propio_perfil(client, employee_user):
    headers = login_headers(client, employee_user.correo, "Empleado1234!")
    response = client.put(
        "/api/auth/me",
        headers=headers,
        json={"direccion": "Calle Empleado 789", "telefono": "3223334455"},
    )
    assert response.status_code == 200
    user = response.json()["user"]
    assert user["direccion"] == "Calle Empleado 789"
    assert user["telefono"] == "3223334455"
    assert user["rol"] == "Empleado"


def test_perfil_propio_no_permite_cambiar_rol_ni_estado(client, customer_user):
    headers = login_headers(client, customer_user.correo, "Cliente1234!")
    response = client.put(
        "/api/auth/me",
        headers=headers,
        json={"nombre": "Sin Privilegios", "rol_id": 1, "estado": "inactivo"},
    )
    assert response.status_code == 200
    user = response.json()["user"]
    assert user["rol"] == "Cliente"
    assert user["estado"] == "activo"


def test_cliente_no_puede_modificar_usuarios_por_id(client, customer_user):
    headers = login_headers(client, customer_user.correo, "Cliente1234!")
    response = client.put(
        f"/api/usuarios/{customer_user.id}",
        headers=headers,
        json={"nombre": "Hackeado"},
    )
    assert response.status_code == 403
