from app.models.entities import Producto

from .conftest import login_headers


def test_ordenes_get_post_patch(client, db, admin_user, customer_user):
    product = Producto(nombre="Juego de prueba", precio=25.0, stock=5, plataforma="PlayStation")
    db.add(product)
    db.commit()
    db.refresh(product)

    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")

    response = client.get("/api/ordenes", headers=customer_headers)
    assert response.status_code == 200
    assert response.json()["ordenes"] == []

    response = client.post(
        "/api/ordenes",
        headers=customer_headers,
        json={"items": [{"producto_id": product.id, "cantidad": 2}], "direccion_envio": "Calle Cliente 456"},
    )
    assert response.status_code == 201
    order_id = response.json()["orden"]["id"]

    response = client.patch(
        f"/api/ordenes/{order_id}/estado",
        headers=admin_headers,
        json={"estado": "completada"},
    )
    assert response.status_code == 200
    assert response.json()["orden"]["estado"] == "completada"