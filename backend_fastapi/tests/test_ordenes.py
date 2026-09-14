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
    assert response.json()["items"] == []

    response = client.post(
        "/api/ordenes",
        headers=customer_headers,
        json={"items": [{"producto_id": product.id, "cantidad": 2}], "direccion_envio": "Calle Cliente 456, Ciudad"},
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


def test_orden_no_encontrada(client, admin_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    response = client.get("/api/ordenes/9999", headers=admin_headers)
    assert response.status_code == 404


def test_orden_stock_insuficiente(client, db, admin_user, customer_user):
    product = Producto(nombre="Juego Sin Stock", precio=30.0, stock=1, plataforma="PlayStation")
    db.add(product)
    db.commit()
    db.refresh(product)

    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")

    response = client.post(
        "/api/ordenes",
        headers=customer_headers,
        json={"items": [{"producto_id": product.id, "cantidad": 10}], "direccion_envio": "Calle Cliente 456, Ciudad"},
    )
    assert response.status_code == 409


def test_orden_estado_invalido(client, db, admin_user, customer_user):
    admin_headers = login_headers(client, admin_user.correo, "Admin1234!")
    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")

    product = Producto(nombre="Juego Estado", precio=35.0, stock=5, plataforma="PlayStation")
    db.add(product)
    db.commit()
    db.refresh(product)

    response = client.post(
        "/api/ordenes",
        headers=customer_headers,
        json={"items": [{"producto_id": product.id, "cantidad": 1}], "direccion_envio": "Calle Cliente 456, Ciudad"},
    )
    assert response.status_code == 201
    order_id = response.json()["orden"]["id"]

    response = client.patch(
        f"/api/ordenes/{order_id}/estado",
        headers=admin_headers,
        json={"estado": "estado_invalido"},
    )
    assert response.status_code == 400


def test_orden_cliente_no_puede_ver_orden_de_otro(client, db, admin_user, customer_user, employee_user):
    from app.models.entities import Usuario
    from app.models.roles import Rol
    from app.core.security import hash_password

    other_customer = Usuario(
        nombre="Otro", apellido="Cliente", tipo_documento="cc",
        numero_documento="100000005", direccion="Calle Otra 999",
        telefono="3000000005", correo="otro@test.com",
        password=hash_password("Otro1234!"), rol_id=3,
    )
    db.add(other_customer)
    db.commit()
    db.refresh(other_customer)

    product = Producto(nombre="Juego Privado", precio=40.0, stock=10, plataforma="PlayStation")
    db.add(product)
    db.commit()
    db.refresh(product)

    other_headers = login_headers(client, other_customer.correo, "Otro1234!")
    response = client.post(
        "/api/ordenes",
        headers=other_headers,
        json={"items": [{"producto_id": product.id, "cantidad": 1}], "direccion_envio": "Calle Otra 999, Ciudad"},
    )
    assert response.status_code == 201
    order_id = response.json()["orden"]["id"]

    customer_headers = login_headers(client, customer_user.correo, "Cliente1234!")
    response = client.get(f"/api/ordenes/{order_id}", headers=customer_headers)
    assert response.status_code == 403
