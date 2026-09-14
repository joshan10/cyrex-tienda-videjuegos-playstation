from app.models.entities import Producto

from .conftest import login_headers


def test_productos_get_post_put_delete(client, db, admin_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")

    response = client.get("/api/productos")
    assert response.status_code == 200

    response = client.post(
        "/api/productos",
        headers=admin_headers,
        json={"nombre": "God of War", "precio": 59.99, "stock": 10, "plataforma": "PlayStation"},
    )
    assert response.status_code == 201
    product_id = response.json()["id"]

    response = client.put(
        f"/api/productos/{product_id}",
        headers=admin_headers,
        json={"nombre": "God of War Ragnarok", "precio": 69.99, "stock": 15},
    )
    assert response.status_code == 200
    assert response.json()["nombre"] == "God of War Ragnarok"

    response = client.delete(f"/api/productos/{product_id}", headers=admin_headers)
    assert response.status_code == 204
    assert db.get(Producto, product_id).estado == "inactivo"


def test_producto_no_encontrado(client, admin_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    response = client.get("/api/productos/9999", headers=admin_headers)
    assert response.status_code == 404


def test_producto_requiere_auth_para_escritura(client, customer_user):
    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    response = client.post(
        "/api/productos",
        headers=customer_headers,
        json={"nombre": "Juego No Permitido", "precio": 10, "stock": 1},
    )
    assert response.status_code == 403


def test_producto_filtros(client, db, admin_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    client.post("/api/productos", headers=admin_headers, json={"nombre": "Juego A", "precio": 10, "plataforma": "PlayStation"})
    client.post("/api/productos", headers=admin_headers, json={"nombre": "Juego B", "precio": 20, "plataforma": "Xbox"})

    response = client.get("/api/productos?plataforma=Xbox", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()["items"]) == 1

    response = client.get("/api/productos?search=Juego A", headers=admin_headers)
    assert response.status_code == 200
    assert len(response.json()["items"]) == 1
