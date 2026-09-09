from app.models.entities import Producto

from .conftest import login_headers


def test_productos_get_post_put_delete(client, db, admin_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")

    response = client.get("/api/productos")
    assert response.status_code == 200
    assert response.json()["productos"] == []

    response = client.post(
        "/api/productos",
        headers=admin_headers,
        json={"nombre": "God of War", "precio": 59.99, "stock": 10, "plataforma": "PlayStation"},
    )
    assert response.status_code == 201
    product_id = response.json()["producto"]["id"]

    response = client.put(
        f"/api/productos/{product_id}",
        headers=admin_headers,
        json={"nombre": "God of War Ragnarok", "precio": 69.99, "stock": 15},
    )
    assert response.status_code == 200
    assert response.json()["producto"]["nombre"] == "God of War Ragnarok"

    response = client.delete(f"/api/productos/{product_id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["producto"]["estado"] == "inactivo"
    assert db.get(Producto, product_id).estado == "inactivo"