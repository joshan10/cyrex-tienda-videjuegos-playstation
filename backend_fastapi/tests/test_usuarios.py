from .conftest import login_headers


def test_usuarios_get_post_put_delete(client, admin_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")

    response = client.get("/api/usuarios", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()["usuarios"]) == 1

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
    user_id = response.json()["usuario"]["id"]

    response = client.put(
        f"/api/usuarios/{user_id}",
        headers=admin_headers,
        json={"nombre": "Usuario Actualizado", "telefono": "3000000099"},
    )
    assert response.status_code == 200
    assert response.json()["usuario"]["nombre"] == "Usuario Actualizado"

    response = client.delete(f"/api/usuarios/{user_id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["usuario"]["estado"] == "inactivo"