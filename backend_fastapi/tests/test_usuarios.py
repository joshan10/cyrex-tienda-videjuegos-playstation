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
